import { ChatOpenAI } from "@langchain/openai";
import { JsonOutputToolsParser } from "langchain/output_parsers";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import { END } from "@langchain/langgraph";
import { AgentStateChannels, ReturnAgentNode } from "./types";
import { RunnableConfig } from "@langchain/core/runnables";
import { IS_PROD } from "@repo/shared/lib/constants";

const systemPrompt =
  "You are a supervisor tasked with managing a conversation between the" +
  " following workers: {members}. Given the following user request," +
  " respond with the worker to act next. Each worker will perform a" +
  " task and respond with their results and status. When finished," +
  " respond with FINISH.";

const prompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    `
      You are an assistant who communicates to satisfy user query, and you are also a supervisor of many agents, delegate the work to them as you see fit to assist user.

      These are the list of agents who you are managing:
      {agentNamesAndDescriptions}

      Given the following user request, respond with the agent to act next, and your reasoning behind it.

      Each agent will perform a task by utilizing function/tool calling, and responds with the task result.
      When finished, respond with {END}.
    `
      .replace(/(?:\r\n|\r|\n)/g, " ")
      .trim(),
  ],
  new MessagesPlaceholder("messages"),
  [
    "system",
    `
      Given the conversation above, evaluate and choose an agent to act next.
      Your options are: {options}.

      Respond with an agent name and your reasoning.
      
      When finished, respond with {END}.
    `
      .replace(/(?:\r\n|\r|\n)/g, " ")
      .trim(),
  ],
]);

export const createToolsAgentsSupervisor = async (
  agentNodes: Pick<ReturnAgentNode, "agentName" | "description">[],
): Promise<ReturnAgentNode> => {
  const agentName = "SUPERVISOR";
  const agentDescription =
    "An assistant who acts as a supervisor that manages multiple agents.";
  const childAgentNames = agentNodes.map(({ agentName }) => agentName);

  const options = [END, ...childAgentNames];

  // Define the routing function
  const toolDef = {
    type: "function",
    function: {
      name: "route",
      description: "The next role to perform the next action.",
      parameters: {
        title: "routeSchema",
        type: "object",
        properties: {
          next: {
            title: "Next agent to act, or end the conversation.",
            anyOf: [
              {
                enum: options,
              },
            ],
          },
          reason: {
            title: "The reason why you choose the next agent.",
            type: "string",
          },
        },
        required: ["next", "reason"],
      },
    },
  } as const;

  // Generate the node for graph
  const node = async (state: AgentStateChannels, config?: RunnableConfig) => {
    const formattedPrompt = await prompt.partial({
      options: options.join(", "),
      agentNamesAndDescriptions: agentNodes
        .map(({ agentName, description }) => `- ${agentName}: ${description}`)
        .join("\n"),
      END,
    });

    const llm = new ChatOpenAI({
      model: "gpt-4o",
      temperature: 0,
      streaming: true,
    });

    const runnable = formattedPrompt
      .pipe(
        llm.bindTools([toolDef], {
          tool_choice: { type: "function", function: { name: "route" } },
        }),
      )
      .pipe(new JsonOutputToolsParser())
      .pipe((elems) => {
        // select the first one
        const firstOutput = elems?.[0] || {},
          { next = END, reason = "" } = firstOutput.args;

        if (!IS_PROD) {
          console.log(`\n| ${agentName}: `, { next, reason }, "\n---\n");
        }

        const output: AgentStateChannels = {
          messages: [],
          previous: agentName,
          next,
        };

        return output;
      });

    return await runnable.invoke(state, config);
  };

  const result: ReturnAgentNode = {
    agentName,
    description: agentDescription,
    node,
  };

  return result;
};
