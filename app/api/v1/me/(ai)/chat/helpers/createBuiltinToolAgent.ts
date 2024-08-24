
import { AuthSessionResponse } from "@data/auth/session/types";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import { RunnableConfig } from "@langchain/core/runnables";
import { AIMessage } from "@langchain/core/messages";
import { AgentStateChannels, ReturnAgentNode } from "./types";
import { ToolInterface } from "@langchain/core/tools";
import { ChatOpenAI } from "@langchain/openai";
import { AgentExecutor, createReactAgent } from "langchain/agents";

const agentName = "InternalAgent";
const agentDescription = "";

// Prompt template must have "input" and "agent_scratchpad input variables"
const promptTemplate = ChatPromptTemplate.fromMessages([
  [
    "system",
    `
      You are a helpful agent who have access to internal builtin functions to curate and manage Node.js VM functions.

      These VM functions are the ones that are being used by other agents like you, to accomplish their tasks.

      Considering to what you have access to, you can perform the following 

      And here is the list of function names:
      - "cloneFunction" (Generate an exact copy of a function and its arguments by providing referenced function ID. Useful for fast-prototyping of a new function using an existing similar one.)
      - "createNewFunction" (Create a new function for the current user by providing a function schema.)
      - "dryRunFunction" (Dry run the code without arguments and returns the result. Expecting hard-coded values in replacement for the arguments. User variables and environment variables are still available in the VM context.)
      - "editFunction" (Edits or updates one or more fields on an existing function after knowing the function ID.)
      - "executeFunction" (Dry run a function by providing referenced function ID and "body" for the function's arguments.)
      - "getCodeTemplate" (Getting the code template for current user. It will show what are the available user and environment variables that are ready to be utilized in the code.)
      - "searchFunctions" (Search functions for id, slug, description, arguments and tags references. The returned records would be from user's own functions and subscribed functions.)
      - "viewFunction" (View a specific function details including by providing id or slug. Function code is visible in the response.)
    `.replace(/(?:\r\n|\r|\n)/g, ' ').trim()
  ],
  new MessagesPlaceholder("messages"),
  new MessagesPlaceholder("agent_scratchpad"),
]);
// type CreateToolsAgentsByAuthSessionParams = Omit<Parameters<typeof createToolCallingAgent>[0], 'tools' | 'prompt'>;

/**
 * Generates a list of tools agents based on the user's collections.
 * This is implemented by following this tutorial 
 * @see https://js.langchain.com/v0.1/docs/modules/agents/agent_types/tool_calling/
 * @info In LangChain - Tool calling is only available with supported models. https://js.langchain.com/v0.1/docs/integrations/chat/
 */
export const createBuiltinToolAgentByAuthSession = async (authSession: AuthSessionResponse, headers: Record<string, any> = {}): Promise<ReturnAgentNode> => {

  function createNode(agentName: string, prompt: ChatPromptTemplate, tools: ToolInterface[]) {
    return async (
      state: AgentStateChannels,
      config?: RunnableConfig,
    ) => {
      const llm = new ChatOpenAI({
        model: "gpt-4o",
        temperature: 0,
        streaming: true,
      });

      const agent = await createReactAgent({ llm, tools, prompt, streamRunnable: true });
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

  const formattedPrompt = await promptTemplate.partial({
    collectionName: '',
  });

  const result: ReturnAgentNode = {
    agentName,
    description: '',
    node: createNode(agentName, formattedPrompt, [])
  };

  return result;
}