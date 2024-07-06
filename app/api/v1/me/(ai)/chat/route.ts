'use server';
/**
 * This file is created by following langgraph tutorial
 * @see https://langchain-ai.github.io/langgraphjs/tutorials/multi_agent/agent_supervisor
 */

import { NextRequest } from 'next/server';
import { StreamingTextResponse } from "ai";
import { convertLangChainMessageToVercelMessage, convertVercelMessageToLangChainMessage } from './helpers/utils';
import { Message as VercelChatMessage } from "ai";
import { apiAuthTryCatch } from '@app/api/utils/apiAuthTryCatch';
import { createToolsGraph } from './helpers/toolsGraph';
import { END } from '@langchain/langgraph';
import { AgentStateChannels } from './helpers/toolsState';


export async function POST(req: NextRequest) {
  const body = await req.json();
  const { returnIntermediateSteps = false } = body || {};

  return await apiAuthTryCatch(async (authSession) => {
    const messages: ReturnType<typeof convertVercelMessageToLangChainMessage> = (body.messages ?? [])
      .filter( (message: VercelChatMessage) => ['user', 'assistant'].indexOf( message.role ) >= 0)
      .map(convertVercelMessageToLangChainMessage);

    /**
     * Generate agents for tools calling
     * @info In LangChain - Tool calling is only available with supported models. https://js.langchain.com/v0.1/docs/integrations/chat/
     */
    const supervisorName = 'SUPERVISOR';
    const toolsGraph = await createToolsGraph(authSession, supervisorName);

    // Return the stream
    const streamResults = await toolsGraph.stream(
      {
        messages,
      },
      { 
        recursionLimit: 100,
        streamMode: 'values'
      },
    );

    const textEncoder = new TextEncoder();
    const transformStream = new ReadableStream({
      async start(controller) {
        for await (const chunk of streamResults) {
          const output = chunk as AgentStateChannels;

          if ( output?.lastMessage ) {
            const messageContent = typeof output.lastMessage.content === 'string' ? output.lastMessage.content : '';

            if ( output?.next === END && messageContent ) {
              controller.enqueue(textEncoder.encode(messageContent));
            }
          }
        }
        controller.close();
      },
    });

    return new StreamingTextResponse(transformStream);

  });
}
