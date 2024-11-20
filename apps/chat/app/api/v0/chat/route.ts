/**
 * This file is created by following langgraph tutorial
 * @see https://langchain-ai.github.io/langgraphjs/tutorials/multi_agent/agent_supervisor
 */

import { END } from '@langchain/langgraph';
import { APP_SESSION_COOKIE_NAME, LANGCHAIN_CHAT_RECURSION_LIMIT } from '@repo/shared/lib/constants';
import { apiAuthTryCatch } from '@repo/shared/utils/apiAuthTryCatch';
import { Message as VercelChatMessage , StreamingTextResponse } from 'ai';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

import { createToolsAgentsByAuthSession } from './helpers/createToolsAgents';
import { createToolsGraph } from './helpers/toolsGraph';
import { AgentStateChannels } from './helpers/types';
import { convertLangChainMessageToVercelMessage, convertVercelMessageToLangChainMessage } from './helpers/utils';

// export const runtime = 'nodejs';
// export const dynamic = 'force-dynamic';
// export const fetchCache = 'force-no-store';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const cookieStore = await cookies();
  const appSessionCookie = cookieStore.get(APP_SESSION_COOKIE_NAME);
  const { returnIntermediateSteps = false } = body || {};

  return await apiAuthTryCatch(async (authSession) => {
    console.log(' ------------ START --------------');
    const messages: ReturnType<typeof convertVercelMessageToLangChainMessage> = (body.messages ?? []).filter((message: VercelChatMessage) => ['user', 'assistant'].indexOf(message.role) >= 0).map(convertVercelMessageToLangChainMessage);

    // const app = await createSimpleGraph(authSession);
    const app = await createToolsGraph(authSession, {
      headers: {
        Cookie: `${APP_SESSION_COOKIE_NAME}=${appSessionCookie?.value}`,
      },
    });

    const textEncoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        const graphStream = await app.stream(
          {
            messages,
          },
          {
            debug: false,
            configurable: {
              threadId: 'test-threadid',
            },
            recursionLimit: LANGCHAIN_CHAT_RECURSION_LIMIT,
            callbacks: [
              {
                handleLLMNewToken(token) {
                  // console.log('\n| token: ', { token });
                  controller.enqueue(textEncoder.encode(token));
                },
                handleToolStart(tool) {
                  console.log('\n| Tool Start: ', { tool });
                },
                handleToolEnd(tool) {
                  console.log('\n| Tool End: ', { tool });
                },
                handleAgentAction(agentAction) {
                  console.log('\n| Agent Action: ', { agentAction });
                },
                handleText(text, runId) {
                  console.log('\n| Text: ', { text, runId });
                  // controller.enqueue(textEncoder.encode(text));
                },
              },
            ],

            /**
             * 'updates': Example output for each streamResults iteration { output: { GoogleSuiteAgent: { messages: [Array] } } }
             * 'values': Example output for each streamResults iteration { output: { messages: [Array] } }
             */
            streamMode: 'updates',
          }
        );

        for await (const output of graphStream) {
          for (const [nodeName, stateValue] of Object.entries<AgentStateChannels>(output)) {
            const lastMessage = stateValue?.messages.slice(-1)[0];
            const messageContent = typeof lastMessage?.content === 'string' ? lastMessage.content : '';
            console.log(`:: nodeName|${nodeName} `, {
              stateValue,
              messageContent: messageContent ?? 'No content',
            });

            if (messageContent) {
              // controller.enqueue(textEncoder.encode(messageContent));
            }
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
