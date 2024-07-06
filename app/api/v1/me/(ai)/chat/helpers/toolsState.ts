import { BaseMessage } from "@langchain/core/messages";
import { StateGraphArgs, END } from "@langchain/langgraph";

export interface AgentStateChannels {
  messages: BaseMessage[];

  lastMessage: BaseMessage | null;

  // The agent node that last performed work
  next: string;
}
// This defines the object that is passed between each node
// in the graph. We will create different nodes for each agent and tool

export const agentStateChannels: StateGraphArgs<AgentStateChannels>["channels"] = {
  messages: {
    value: (x?: BaseMessage[], y?: BaseMessage[]) => (x ?? []).concat(y ?? []),
    default: () => [],
  },
  lastMessage: null,
  next: {
    value: (x?: string, y?: string) => y ?? x ?? END,
    default: () => END,
  },
};
