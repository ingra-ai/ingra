import { BaseMessage } from "@langchain/core/messages";
import { RunnableConfig, RunnableLike } from "@langchain/core/runnables";
import { Prisma } from "@repo/db/prisma";

export interface AgentStateChannels {
  messages: BaseMessage[];

  // The previous agent node that last performed work
  previous?: string;

  // The next agent node that would perform work.
  next?: string;
}

export type ReturnAgentNode<T = unknown> = {
  agentName: string;
  description: string;
  node: (
    state: AgentStateChannels,
    config?: RunnableConfig,
  ) => RunnableLike<AgentStateChannels, T>;
};

export type CollectionForToolsGetPayload = Prisma.CollectionGetPayload<{
  include: {
    owner: {
      select: {
        id: true;
        profile: {
          select: {
            userName: true;
          };
        };
      };
    };
    functions: {
      select: {
        id: true;
        code: false;
        isPrivate: false;
        ownerUserId: false;
        httpVerb: true;
        slug: true;
        description: true;
        arguments: true;
        tags: true;
      };
    };
  };
}>;
