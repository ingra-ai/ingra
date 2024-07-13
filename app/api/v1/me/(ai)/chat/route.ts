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
import { AgentStateChannels } from './helpers/types';
import { APP_SESSION_COOKIE_NAME, LANGCHAIN_CHAT_RECURSION_LIMIT } from '@lib/constants';
import { createSimpleGraph } from './helpers/simpleGraph';
import { createToolsAgentsByAuthSession } from './helpers/toolsAgents';
import { cookies } from 'next/headers';

// export const runtime = 'nodejs';
// export const dynamic = 'force-dynamic';
// export const fetchCache = 'force-no-store';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const cookieStore = cookies();
  const appSessionCookie = cookieStore.get(APP_SESSION_COOKIE_NAME);
  const { returnIntermediateSteps = false } = body || {};

  return await apiAuthTryCatch(async (authSession) => {
    console.log(' ------------ START --------------')
    const messages: ReturnType<typeof convertVercelMessageToLangChainMessage> = (body.messages ?? [])
      .filter( (message: VercelChatMessage) => ['user', 'assistant'].indexOf( message.role ) >= 0)
      .map(convertVercelMessageToLangChainMessage);

    // const app = await createSimpleGraph(authSession);
    const app = await createToolsGraph(authSession, {
      headers: {
        'Cookie': `${APP_SESSION_COOKIE_NAME}=${appSessionCookie?.value}`
      }
    });

    const textEncoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {

        const test = await app.stream(
          {
            messages,
          },
          {
            configurable: {
              threadId: 'test-threadid'
            },
            recursionLimit: LANGCHAIN_CHAT_RECURSION_LIMIT,
            callbacks: [
              {
                handleLLMNewToken(token) {
                  controller.enqueue(textEncoder.encode(token));
                },
                handleToolStart(tool) {
                  console.log('Tool Start: ', tool.name);
                },
                handleToolEnd(tool) {
                  console.log('Tool End: ', tool);
                }

              },
            ],
    
            /**
             * 'updates': Example output for each streamResults iteration { output: { GoogleSuiteAgent: { messages: [Array] } } }
             * 'values': Example output for each streamResults iteration { output: { messages: [Array] } }
             */
            streamMode: 'updates'
          },
        );

        for await (const output of test) {

          // console.log({ output })

          for (const [nodeName, stateValue] of Object.entries<AgentStateChannels>(output)) {

            const lastMessage = stateValue?.messages.slice(-1)[0];
            const messageContent = typeof lastMessage.content === 'string' ? lastMessage.content : '';
            console.log(`:: ${ nodeName } `, {
              stateValue,
              messageContent
            });
            // controller.enqueue(textEncoder.encode(messageContent));
          }

          // if ( output?.next === END ) {
          //   const lastMessage = output?.messages.slice(-1)[0];
          //   const messageContent = typeof lastMessage.content === 'string' ? lastMessage.content : '';
          //   controller.enqueue(textEncoder.encode(messageContent));
          // }
        }

        // Cleanup
        controller.close();
      },

    });

    return new StreamingTextResponse(readableStream);
  });
}
