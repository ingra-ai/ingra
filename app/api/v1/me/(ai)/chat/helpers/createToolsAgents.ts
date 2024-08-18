
import { AuthSessionResponse } from "@app/auth/session/types";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import { RunnableConfig } from "@langchain/core/runnables";
import { AIMessage } from "@langchain/core/messages";
import { APP_URL, USERS_API_COLLECTION_FUNCTION_PATH } from "@lib/constants";
import { Logger } from "@lib/logger";
import { AgentStateChannels, CollectionForToolsGetPayload, ReturnAgentNode } from "./types";
import { getCollectionsForTools } from "./getCollectionsForTools";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { functionArgsToZod } from "@app/api/utils/functions/functionArgsToZod";
import { apiRequest } from "./apiRequest";
import { ChatOpenAI } from "@langchain/openai";
import { AgentExecutor, createOpenAIToolsAgent } from "langchain/agents";

// Prompt template must have "input" and "agent_scratchpad input variables"
const promptTemplate = ChatPromptTemplate.fromMessages([
  [
    "system",
    `
      You are a helpful agent who have access to functions inside a collection of "{collectionName}".

      This collection has {functionsLength} functions, with the following descriptions:
      """{collectionDescription}"""

      And here is the list of function names:
      """{functionNames}"""
    `.replace(/(?:\r\n|\r|\n)/g, ' ').trim()
  ],
  new MessagesPlaceholder("messages"),
  new MessagesPlaceholder("agent_scratchpad"),
]);

const collectionFunctionsToDynamicTools = (
  collection: CollectionForToolsGetPayload,
  options: {
    headers: Record<string, any>;
    isSubscription?: boolean;
  }
) => {
  const { headers = {}, isSubscription = false } = options;

  const functionDynamicTools = collection.functions.map((functionRecord) => {
    const collectionSlug = collection.slug,
      functionSlug = functionRecord.slug,
      ownerUsername = collection.owner.profile?.userName;

    const tool = new DynamicStructuredTool({
      name: functionRecord.slug,
      description: functionRecord.description,
      schema: functionArgsToZod(functionRecord.arguments),
      func: async (requestArgs = {}) => {
        const loggerObj = Logger
          .withTag('api|langchainFunction')
          .withTag(`functionId|${functionRecord.id}`)
          .withTag(`functionSlug|${functionSlug}`)
          .withTag(`collectionSlug|${collectionSlug}`);

        const hitUrl = [
          APP_URL,
          USERS_API_COLLECTION_FUNCTION_PATH
            .replace(':userName', ownerUsername!)
            .replace(':collectionSlug', collectionSlug)
            .replace(':functionSlug', functionSlug)
        ].join('');

        loggerObj.info(`Executing langchain function`);

        const result = await apiRequest( hitUrl, functionRecord.httpVerb, requestArgs, headers );

        return JSON.stringify(result);
      }
    });
    
    return tool;
  });

  return functionDynamicTools;
}

// type CreateToolsAgentsByAuthSessionParams = Omit<Parameters<typeof createToolCallingAgent>[0], 'tools' | 'prompt'>;

/**
 * Generates a list of tools agents based on the user's collections.
 * This is implemented by following this tutorial 
 * @see https://js.langchain.com/v0.1/docs/modules/agents/agent_types/tool_calling/
 * @info In LangChain - Tool calling is only available with supported models. https://js.langchain.com/v0.1/docs/integrations/chat/
 */
export const createToolsAgentsByAuthSession = async (authSession: AuthSessionResponse, headers: Record<string, any> = {}): Promise<ReturnAgentNode[]> => {
  /**
   * First step is to grab all collections and functions from the user.
   * A collection equals to an agent. And this agent is responsible for calling the tools inside this collection.
   */
  const [myCollections, subCollections] = await getCollectionsForTools(authSession);

  function createNode(agentName: string, prompt: ChatPromptTemplate, tools: DynamicStructuredTool[]) {
    return async (
      state: AgentStateChannels,
      config?: RunnableConfig,
    ) => {
      const llm = new ChatOpenAI({
        model: "gpt-4o",
        temperature: 0,
        streaming: true,
      });

      const agent = await createOpenAIToolsAgent({ llm, tools, prompt, streamRunnable: true });
      const executor = new AgentExecutor({ ...config, agent, tools }).withConfig({ runName: agentName });

      // Generate the agent.
      // `.invoke` can be streamed by listening from graph.stream[callbacks][handleLLMNewToken]
      const result = await executor.invoke(state, config);

      const returnState: AgentStateChannels = {
        messages: result?.output ? 
          [new AIMessage({ content: result.output, name: agentName })] : [],
        previous: agentName
      }

      return returnState;
    }
  }

  const myToolAgents = myCollections.map(async (collection) => {
    const agentName = [collection.name, 'Agent'].join(' ').replace(/\s+/g, ''),
      tools = collectionFunctionsToDynamicTools(collection, { headers }),
      formattedPrompt = await promptTemplate.partial({
        collectionName: collection.name,
        functionsLength: collection.functions.length.toString(),
        collectionDescription: collection.description || '',
        functionNames: collection.functions.map(func => `- ${func.slug}`).join('\n')
      }),
      node = createNode(agentName, formattedPrompt, tools);
  
    const result: ReturnAgentNode = {
      agentName,
      description: collection.description || '',
      node
    };

    return result;
  });

  const subToolAgents = subCollections.map(async (collection) => {
    const agentName = [collection.name, 'SubAgent'].join(' ').replace(/\s+/g, ''),
      tools = collectionFunctionsToDynamicTools(collection, { headers, isSubscription: true}),
      formattedPrompt = await promptTemplate.partial({
        collectionName: collection.name,
        functionsLength: collection.functions.length.toString(),
        collectionDescription: collection.description || '',
        functionNames: collection.functions.map(func => `- ${func.slug}`).join('\n')
      }),
      node = createNode(agentName, formattedPrompt, tools);
  
    const result: ReturnAgentNode = {
      agentName,
      description: collection.description || '',
      node
    };

    return result;
  });

  const concatAgents = await Promise.all([...myToolAgents, ...subToolAgents]);

  return concatAgents;
}