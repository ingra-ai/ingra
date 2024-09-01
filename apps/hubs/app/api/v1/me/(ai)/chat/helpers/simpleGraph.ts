import { AuthSessionResponse } from '@repo/shared/data/auth/session/types';
import { ChatOpenAI } from '@langchain/openai';
import { createToolsAgentsByAuthSession } from './createToolsAgents';
import { createToolsAgentsSupervisor } from './createToolsAgentsSupervisor';
import { END, START, StateGraph, StateGraphArgs } from '@langchain/langgraph';
import { AgentStateChannels } from './types';
import { AIMessage, BaseMessage } from '@langchain/core/messages';
import { RunnableConfig, RunnableLike } from '@langchain/core/runnables';
import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts';
import { JsonOutputToolsParser } from 'langchain/output_parsers';

// Create llm that will be used by the tool agents.
const llm = new ChatOpenAI({
  model: 'gpt-4-0125-preview',
  temperature: 0,
  streaming: true,
});

// Generate system prompt.
const systemPrompt = `
  You are a helpful assistant
`.trim();

// Prompt template must have "input" and "agent_scratchpad input variables"
const prompt = ChatPromptTemplate.fromMessages([
  ['system', systemPrompt],
  new MessagesPlaceholder('messages'),
  // new MessagesPlaceholder("agent_scratchpad"),
]);

type CreateToolsGraphOptions = {
  supervisorAgentName?: string;
  // workerAgents: RunnableLike<AgentStateChannels, unknown>[];
};

/**
 * Create a graph that will manage the conversation between the user and the tools.
 * @param {AuthSessionResponse} authSession - The user's authentication session
 * @reference https://github.com/bracesproul/langtool-template/blob/finished/backend/src/index.ts#L58
 */
export const createSimpleGraph = async (authSession: AuthSessionResponse, opts?: CreateToolsGraphOptions) => {
  // This defines the object that is passed between each node
  // in the graph. We will create different nodes for each agent and tool
  const agentStateChannels: StateGraphArgs<AgentStateChannels>['channels'] = {
    messages: {
      value: (x?: BaseMessage[], y?: BaseMessage[]) => {
        // console.log('\n---', { x, y }, '\n----\n')
        return (x ?? []).concat(y ?? []);
      },
      default: () => [],
    },
  };

  // Create the graph
  const graph = new StateGraph<AgentStateChannels, unknown, string>({
    channels: agentStateChannels,
  });

  graph.addNode('SUPERVISOR', async (state: AgentStateChannels, config?: RunnableConfig) => {
    console.log('\n--- supervisor node', { state }, '\n----\n');

    const readableStream = await prompt.pipe(llm).stream(state, config);
    let content = '';

    for await (const testStream of readableStream) {
      content += testStream.content;
    }

    console.log('\n--- supervisor node result stream ends \n----\n');

    return {
      messages: [new AIMessage({ content })],
    };
  });

  graph.addEdge(START, 'SUPERVISOR');
  graph.addConditionalEdges('SUPERVISOR', (state) => {
    console.log('\n::Conditional Edge', { state });
    return END;
  });
  graph.addEdge('SUPERVISOR', END);

  // Compile the graph
  const runnable = graph.compile();

  // Return the compiled graph
  return runnable;
};
