import { BaseMessage } from '@langchain/core/messages';
import { RunnableLike } from '@langchain/core/runnables';
import { END, START, StateGraph, Annotation } from '@langchain/langgraph';
import { ChatOpenAI } from '@langchain/openai';
import { AuthSessionResponse } from '@repo/shared/data/auth/session/types';

import { createToolsAgentsByAuthSession } from './createToolsAgents';
import { createToolsAgentsSupervisor } from './createToolsAgentsSupervisor';
import { AgentStateChannels } from './types';


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
  const agentState = Annotation.Root({
    messages: Annotation<BaseMessage[]>({
      reducer: (x, y) => x.concat(y),
      default: () => [],
    }),
    previous: Annotation<string>({
      reducer: (x, y) => y ?? x ?? START,
      default: () => START,
    }),
    next: Annotation<string>({
      reducer: (x, y) => y ?? x ?? END,
      default: () => END,
    })
  });

  // Create the graph
  const graph = new StateGraph(agentState);

  // 1. Add the tool agents nodes
  for (let i = 0, len = collectionToolsAgents.length; i < len; i++) {
    const collectionToolsAgent = collectionToolsAgents[i];
    graph.addNode(collectionToolsAgent.agentName, collectionToolsAgent.node);
  }

  // 2. Add the supervisor node
  graph.addNode(toolsSupervisorAgent.agentName, toolsSupervisorAgent.node);

  // Define the edges, after tool agents done their work, they will report to the supervisor
  toolAgentNames.forEach((toolAgentName) => {
    // @ts-ignore
    graph.addEdge(toolAgentName, supervisorAgent.agentName);
    // graph.addEdge(toolAgentName, END);
  });

  // Whenever supervisor is in the act, it will decide who should act next
    // @ts-ignore
  graph.addConditionalEdges(toolsSupervisorAgent.agentName, (state) => {
    const { previous, next, messages } = state;
    // console.log('\n-----conditionalEdge:supervisor----\n', { previous, next }, '\n--------\n')
    return state?.next || END;
  });

  // Add the start node
    // @ts-ignore
  graph.addEdge(START, toolsSupervisorAgent.agentName);

  // Compile the graph
  const app = graph.compile();

  // Return the compiled graph
  return app;
};
