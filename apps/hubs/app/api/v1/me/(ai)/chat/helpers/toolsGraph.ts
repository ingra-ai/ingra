import { AuthSessionResponse } from '@repo/shared/data/auth/session/types';
import { ChatOpenAI } from '@langchain/openai';
import { createToolsAgentsByAuthSession } from './createToolsAgents';
import { createToolsAgentsSupervisor } from './createToolsAgentsSupervisor';
import { END, START, StateGraph, StateGraphArgs } from '@langchain/langgraph';
import { AgentStateChannels } from './types';
import { BaseMessage } from '@langchain/core/messages';
import { RunnableLike } from '@langchain/core/runnables';

type CreateToolsGraphOptions = {
  headers: Record<string, any>;
};

/**
 * Create a graph that will manage the conversation between the user and the tools.
 * @param {AuthSessionResponse} authSession - The user's authentication session
 * @reference https://github.com/bracesproul/langtool-template/blob/finished/backend/src/index.ts#L58
 */
export const createToolsGraph = async (authSession: AuthSessionResponse, opts?: CreateToolsGraphOptions) => {
  const { headers = {} } = opts ?? {};

  /**
   * Generate agents for tools calling
   * @info In LangChain - Tool calling is only available with supported models. https://js.langchain.com/v0.1/docs/integrations/chat/
   */
  const collectionToolsAgents = await createToolsAgentsByAuthSession(authSession, headers),
    toolAgentNames = collectionToolsAgents.map((collectionToolsAgent) => collectionToolsAgent.agentName);

  /**
   * Generate supervisor to handle the tools agents.
   */
  const toolsSupervisorAgent = await createToolsAgentsSupervisor(collectionToolsAgents);

  // This defines the object that is passed between each node
  // in the graph. We will create different nodes for each agent and tool
  const agentStateChannels: StateGraphArgs<AgentStateChannels>['channels'] = {
    messages: {
      value: (x?: BaseMessage[], y?: BaseMessage[]) => {
        // console.log('\n-----channels:messages----\n', { x, y }, '\n--------\n')
        return (x ?? []).concat(y ?? []);
      },
      default: () => [],
    },
    previous: {
      value: (x?: string, y?: string) => {
        // console.log('\n-----channels:previous----\n', { x, y }, '\n--------\n')
        return y ?? x ?? START;
      },
      default: () => START,
    },
    next: {
      value: (x?: string, y?: string) => {
        // console.log('\n-----channels:next----\n', { x, y }, '\n--------\n')
        return y ?? x ?? END;
      },
      default: () => END,
    },
  };

  // Create the graph
  const graph = new StateGraph<AgentStateChannels, unknown, string>({
    channels: agentStateChannels,
  });

  // 1. Add the tool agents nodes
  for (let i = 0, len = collectionToolsAgents.length; i < len; i++) {
    const collectionToolsAgent = collectionToolsAgents[i];
    graph.addNode(collectionToolsAgent.agentName, collectionToolsAgent.node);
  }

  // 2. Add the supervisor node
  graph.addNode(toolsSupervisorAgent.agentName, toolsSupervisorAgent.node);

  // Define the edges, after tool agents done their work, they will report to the supervisor
  toolAgentNames.forEach((toolAgentName) => {
    // graph.addEdge(toolAgentName, supervisorAgent.agentName);
    graph.addEdge(toolAgentName, END);
  });

  // Whenever supervisor is in the act, it will decide who should act next
  graph.addConditionalEdges(toolsSupervisorAgent.agentName, (state) => {
    const { previous, next, messages } = state;
    // console.log('\n-----conditionalEdge:supervisor----\n', { previous, next }, '\n--------\n')
    return state?.next || END;
  });

  // Add the start node
  graph.addEdge(START, toolsSupervisorAgent.agentName);

  // Compile the graph
  const app = graph.compile();

  // Return the compiled graph
  return app;
};
