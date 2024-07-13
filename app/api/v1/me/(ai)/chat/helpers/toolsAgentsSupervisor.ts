import { ChatOpenAI } from "@langchain/openai";
import { JsonOutputToolsParser } from "langchain/output_parsers";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { END } from "@langchain/langgraph";
import { AgentStateChannels, ReturnAgentNode } from "./types";
import { RunnableConfig } from "@langchain/core/runnables";
import { IS_PROD } from "@lib/constants";
import { Logger } from "@lib/logger";
import { AIMessage } from "@langchain/core/messages";

const systemPrompt = `
You are a supervisor tasked with managing following agents: {agentNames}.
Given the following user request, respond with the agent to act next.

Each agent will perform a task by utilizing function calling, and respond with the task result.
When finished, respond with {END}.
If you think you had performed the same action, response with {END}.
`.replace(/(?:\r\n|\r|\n)/g, ' ').trim();

const prompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    `
      You are an assistant who communicates directly to user to satisfy their query, and you are also a supervisor equipped with a route tool to perform a task by delegating it to the next agent.

      These are the list of agents who you are managing: {agentNames}.

      Given the following user request, respond with the agent to act next.

      Each agent will perform a task by utilizing function/tool calling, and responds with the task result.
      When finished, respond with {END}.
    `.replace(/(?:\r\n|\r|\n)/g, ' ').trim()
  ],
  new MessagesPlaceholder("messages"),
  [
    "system",
    `
      Given the conversation above, evaluate if you should respond to user or choose an agent to act next.

      If you think function/tool calling is required to accomplish user request, call the route action by providing your reason and select one of: {options}.

      Make sure to communicate briefly and efficiently, and do not afraid to ask questions back to user rather than making assumptions.

      You may do pep talk, being funny or a bit of sarcastic. But remember, the goal is to assist user in the best way possible.

      When finished, respond with {END}.
    `.replace(/(?:\r\n|\r|\n)/g, ' ').trim()
  ],
]);

export const createToolsAgentsSupervisor = async (agentNodes: Pick<ReturnAgentNode, 'agentName' | 'description'>[]): Promise<ReturnAgentNode> => {
  const agentName = "SUPERVISOR";
  const agentDescription = "An assistant who acts as a supervisor that manages multiple agents.";
  const childAgentNames = agentNodes.map(({ agentName }) => agentName);

  const options = [END, ...childAgentNames];

  // Define the routing function
  const toolDef = {
    type: "function",
    function: {
      name: "route",
      description: "Short response and/or to select the next role to perform the next action.",
      parameters: {
        title: "routeSchema",
        type: "object",
        properties: {
          messageToUser: {
            title: "A short message to respond to user.",
            type: "string",
            minLength: 10,
            maxLength: 100,
          },
          next: {
            title: "Next agent to act, or end the conversation.",
            anyOf: [
              { 
                enum: options 
              },
            ],
          },
          reason: {
            title: "The reason why you choose the next agent.",
            type: "string",
          }
        },
        required: ["messageToUser", "next", "reason"],
      },
    },
  } as const;

  // Generate the node for graph
  const node = async (
    state: AgentStateChannels,
    config?: RunnableConfig,
  ) => {
    const formattedPrompt = await prompt.partial({
      options: options.join(", "),
      agentNames: childAgentNames.join(", "),
      END,
    });

    const llm = new ChatOpenAI({
      model: "gpt-4o",
      temperature: 0,
      streaming: true,
    });

    const runnable = formattedPrompt
      .pipe(llm.bindTools(
        [toolDef],
        {
          tool_choice: { "type": "function", "function": { "name": "route" } },
        },
      ))
      .pipe(new JsonOutputToolsParser())
      .pipe((elems) => {
        // select the first one
        const firstOutput = elems?.[0] || {},
          { messageToUser = '', next = END, reason = '' } = firstOutput.args;

        const output: AgentStateChannels = {
          // messages: (
          //   messageToUser?.length ? [new AIMessage({ content: messageToUser })] : []
          // ),
          messages: [],
          previous: agentName,
          next,
        }

        return output;
      });

    return runnable.invoke(state, config);
  };

  const result: ReturnAgentNode = {
    agentName,
    description: agentDescription,
    node,
  };

  return result;
};