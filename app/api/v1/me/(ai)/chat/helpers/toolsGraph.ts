import { AuthSessionResponse } from "@app/auth/session/types";
import { ChatOpenAI } from "@langchain/openai";
import { createToolsAgentsByAuthSession } from "./toolsAgents";
import { createToolsAgentsSupervisor } from "./toolsAgentsSupervisor";
import { END, START, StateGraph } from "@langchain/langgraph";
import { AgentStateChannels, agentStateChannels } from "./toolsState";

/**
 * Create a graph that will manage the conversation between the user and the tools.
 * @param {AuthSessionResponse} authSession - The user's authentication session
 * @reference https://github.com/bracesproul/langtool-template/blob/finished/backend/src/index.ts#L58
 */
export const createToolsGraph = async (authSession: AuthSessionResponse, supervisorAgentName = 'SUPERVISOR') => {
  // Create llm that will be used by the tool agents.
  const llm = new ChatOpenAI({
    model: "gpt-4-0125-preview",
    temperature: 0,
  });

  /**
   * Generate agents for tools calling
   * @info In LangChain - Tool calling is only available with supported models. https://js.langchain.com/v0.1/docs/integrations/chat/
   */
  const collectionToolsAgents = await createToolsAgentsByAuthSession(authSession, {
      llm,
    }),
    agentNames = collectionToolsAgents.map( (collectionToolsAgent) => collectionToolsAgent.agentName );
    
  /**
   * Generate supervisor to handle the tools agents.
   */
  const supervisorAgent = await createToolsAgentsSupervisor( agentNames );
  
  // Create the graph
  const graph = new StateGraph<AgentStateChannels, unknown, string>({
    channels: agentStateChannels,
  });

  // Add the agents nodes
  for ( let i = 0, len = collectionToolsAgents.length; i < len; i++ ) {
    const collectionToolsAgent = collectionToolsAgents[i];
    graph.addNode(collectionToolsAgent.agentName, collectionToolsAgent.node);
  }

  // Add the supervisor node
  graph.addNode(supervisorAgentName, supervisorAgent);

  // Define the edges. We will define both regular and conditional ones
  // After collection tool agents complete their work, report to supervisor
  agentNames.forEach((agentName) => {
    graph.addEdge(agentName, supervisorAgentName);
  });

  // After supervisor receives the report, decide which agent to act next
  graph.addConditionalEdges(
    supervisorAgentName,
    (x) => {
      return x.next;
    },
  );

  // Add the start node
  graph.addEdge(START, supervisorAgentName);

  // Compile the graph
  const app = graph.compile();

  // Return the compiled graph
  return app;
};