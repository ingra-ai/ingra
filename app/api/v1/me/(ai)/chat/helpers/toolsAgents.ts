
import { AuthSessionResponse } from "@app/auth/session/types";
import db from "@lib/db";
import { AgentExecutor, createToolCallingAgent } from "langchain/agents";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import { RunnableConfig } from "@langchain/core/runnables";
import { AIMessage } from "@langchain/core/messages";
import { IS_PROD } from "@lib/constants";
import { Logger } from "@lib/logger";
import { convertFunctionRecordToDynamicStructuredTool } from "./convertFunctionRecordToDynamicStructuredTool";
import { AgentStateChannels } from "./toolsState";

type CreateToolsAgentsByAuthSessionParams = Omit<Parameters<typeof createToolCallingAgent>[0], 'tools' | 'prompt'>;

/**
 * Generates a list of tools agents based on the user's collections.
 * This is implemented by following this tutorial 
 * @see https://js.langchain.com/v0.1/docs/modules/agents/agent_types/tool_calling/
 * @info In LangChain - Tool calling is only available with supported models. https://js.langchain.com/v0.1/docs/integrations/chat/
 */
export const createToolsAgentsByAuthSession = async (authSession: AuthSessionResponse, params: CreateToolsAgentsByAuthSessionParams) => {
  /**
   * 1. First step is to grab all collections and functions from the user.
   * A collection equals to an agent. And this agent is responsible for calling the tools inside this collection.
   */
  const [myCollections, myCollectionSubscriptions] = await Promise.all([
    // Get the collections of the user
    db.collection.findMany({
      where: {
        userId: authSession.user.id,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        functions: {
          select: {
            id: true,
            code: false,
            isPrivate: false,
            ownerUserId: false,
            httpVerb: true,
            slug: true,
            description: true,
            arguments: true,
            tags: true,
          },
        },
      },
    }),

    // Get the collections that the user is subscribed to
    db.collectionSubscription.findMany({
      where: {
        collection: {
          userId: authSession.user.id
        },
        userId: authSession.user.id,
      },
      select: {
        collection: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            functions: {
              select: {
                id: true,
                code: false,
                isPrivate: false,
                ownerUserId: false,
                httpVerb: true,
                slug: true,
                description: true,
                arguments: true,
                tags: true,
              },
            },
          }
        }
      },
    }),
  ]);

  /**
   * 2. Compile all collections and functions into a single array.
   */
  const collections = myCollections.concat(myCollectionSubscriptions.map(sub => sub.collection));

  /**
   * 3. Create the tools agents.
   */
  const result = collections.map( async ( collection ) => {
    // Generate the agent name. It can't contain spaces.
    const agentName = [collection.name, 'Agent'].join(' ').replace(/\s+/g, '');

    // Generate system prompt.
    const systemPrompt = `
      You are a helpful agent for functions calling in the collection "${collection.name}".

      This collection has ${collection.functions.length} functions, with the following descriptions:
      \`\`\`
      ${collection.description}
      \`\`\`

      And here is the list of function names:
      \`\`\`
      ${collection.functions.map( func => `- ${func.slug}` ).join('\n')}
      \`\`\`
    `.trim();
    
    // Prompt template must have "input" and "agent_scratchpad input variables"
    const prompt = ChatPromptTemplate.fromMessages([
      ["system", systemPrompt],
      new MessagesPlaceholder("messages"),
      new MessagesPlaceholder("agent_scratchpad"),
    ]);

    // Generate the tools that will be used by the agent.
    const tools = collection.functions.map( ( func ) => {
      return convertFunctionRecordToDynamicStructuredTool( authSession, func );
    } );

    // Generate the agent.
    const agent = createToolCallingAgent({
      ...params,
      prompt,
      tools
    });

    // Generate the agent executor which returns Runnable.
    const executor = new AgentExecutor({ agent, tools });

    // Generate the node for graph
    const node = async (
      state: AgentStateChannels,
      config?: RunnableConfig,
    ) => {
      const result = await executor.invoke(state, config);

      if ( !IS_PROD ) {
        Logger.withTag('toolsAgents').log({ agentName, output: result.output });
      }

      const outputMessage = new AIMessage({ content: result.output, name: agentName });

      return {
        messages: [
          outputMessage,
        ],
        lastMessage: outputMessage,
      };
    };

    return {
      agentName,
      description: collection.description,
      node
    }
  } );

  return await Promise.all( result );
}