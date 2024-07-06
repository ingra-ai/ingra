import { ChatOpenAI } from "@langchain/openai";
import { JsonOutputToolsParser } from "langchain/output_parsers";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { END } from "@langchain/langgraph";


export const createToolsAgentsSupervisor = async (agentNames: string[]) => {
  const systemPrompt = `
    You are a supervisor tasked with managing following agents: {agentNames}.
    Given the following user request, respond with the agent to act next.

    Each agent will perform a task by utilizing function calling, and respond with the task result.
    When finished, respond with {END}.
  `.trim();

  const options = [END, ...agentNames];
  
  // Define the routing function
  const functionDef = {
    name: "route",
    description: "Select the next role.",
    parameters: {
      title: "routeSchema",
      type: "object",
      properties: {
        next: {
          title: "Next",
          anyOf: [
            { enum: options },
          ],
        }
      },
      required: ["next"],
    },
  };
  
  const toolDef = {
    type: "function",
    function: functionDef,
  } as const;

  const prompt = ChatPromptTemplate.fromMessages([
    ["system", systemPrompt],
    new MessagesPlaceholder("messages"),
    [
      "system",
      `
        Given the conversation above, who should act next?
        Select one of: {options}

        If an error or failure occurs from the tools, choose {END}.
      `.trim()
    ],
  ]);

  const formattedPrompt = await prompt.partial({
    options: options.join(", "),
    agentNames: agentNames.join(", "),
    END,
  });
  
  const llm = new ChatOpenAI({
    modelName: "gpt-4o",
    temperature: 0,
  });
  
  const supervisorRunnable = formattedPrompt
    .pipe(llm.bindTools(
      [toolDef],
      {
        tool_choice: { "type": "function", "function": { "name": "route" } },
      },
    ))
    .pipe(new JsonOutputToolsParser())
    // select the first one
    .pipe((x) => (x[0].args));

  return supervisorRunnable;
};