import { APP_SESSION_COOKIE_NAME, BAKA_ASSISTANT_ID, BAKA_ASSISTANT_USER_THREAD_COOKIE_MAX_AGE, BAKA_ASSISTANT_USER_THREAD_COOKIE_NAME, OPENAI_API_KEY } from '@repo/shared/lib/constants';
import { Logger } from '@repo/shared/lib/logger';
import { ActionError } from '@repo/shared/types';
import { apiAuthTryCatch } from '@repo/shared/utils/apiAuthTryCatch';
import { type Message } from 'ai';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

import { AssistantResponse } from './AssistantResponse';
import { actionToolCalls } from './toolsHandler';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '10');
  let threadId = searchParams.get('threadId') || '';

  return await apiAuthTryCatch(async (authSession) => {
    if (!OPENAI_API_KEY || !BAKA_ASSISTANT_ID) {
      throw new ActionError('error', 500, 'The assistant seems to be offline right now. Please try again later.');
    }

    const openai = new OpenAI({
        apiKey: OPENAI_API_KEY,
      }),
      messages: Message[] = [];

    if (!threadId) {
      // No thread ID, create a new thread
      const newThread = await openai.beta.threads.create({
        tool_resources: {},
      });

      threadId = newThread.id;
    } else {
      // Thread ID already exists, fetch the messages
      const existingMessagePage = await openai.beta.threads.messages.list(threadId, {
        limit,
        order: 'desc',
      });

      const existingMessages = (existingMessagePage.data || [])
        .map((threadMessage) => {
          const content = threadMessage.content?.[0];

          if (content?.type === 'text' && content?.text) {
            return {
              id: threadMessage.id,
              role: threadMessage.role,
              content: content.text.value,
            };
          } else {
            return null;
          }
        })
        .filter(Boolean) as Message[];

      // Invert messages order
      existingMessages.reverse();

      // Push the messages to the response
      messages.push(...existingMessages);
    }

    return NextResponse.json(
      {
        status: 'success',
        message: 'Successfully retrieved assistant messages.',
        data: {
          threadId: threadId,
          messages,
        },
      },
      {
        status: 200,
        headers: {
          'Set-Cookie': `${BAKA_ASSISTANT_USER_THREAD_COOKIE_NAME}=${threadId}; Path=/; Max-Age=${BAKA_ASSISTANT_USER_THREAD_COOKIE_MAX_AGE}; SameSite=Strict; Secure; HttpOnly`,
        },
      }
    );
  });
}

/**
 * @ swagger
 * /api/v1/me/assistants:
 *   post:
 *     summary: Get a streaming response from assistant
 *     operationId: getAssistantResponse
 *     description: Get a streaming response from assistant based on the user input. Running based on OpenAI Assistant API.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               theadId:
 *                 type: string
 *                 description: The thread ID for the assistant to continue the conversation
 *                 nullable: true
 *               message:
 *                 type: string
 *                 default: ""
 *                 description: The input message from the user. Default is an empty string
 *                 required: true
 *     responses:
 *       '200':
 *         description: Successfully retrieved streaming response
 *         content:
 *           text/event-stream:
 *             schema:
 *               type: string
 *               description: The streaming response output from the assistant
 *       '400':
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *     tags:
 *       - Built-ins Internal
 */
export async function POST(request: NextRequest) {
  // Parse the request body
  const { threadId, message } = await request.json();
  const cookieStore = await cookies();
  const bakaSessionCookie = cookieStore.get(APP_SESSION_COOKIE_NAME);

  return await apiAuthTryCatch(async (authSession) => {
    if (!threadId) {
      throw new ActionError('error', 400, 'Assistant thread ID is not found. Please try again later.');
    }

    if (!bakaSessionCookie) {
      throw new ActionError('error', 400, 'No browser session found for the user. Please try again later or refresh the page.');
    }

    if (!message) {
      throw new ActionError('error', 400, 'Message is required.');
    }

    if (!OPENAI_API_KEY || !BAKA_ASSISTANT_ID) {
      throw new ActionError('error', 500, 'The assistant seems to be offline right now. Please try again later.');
    }

    const openai = new OpenAI({
      apiKey: OPENAI_API_KEY,
    });

    // Add a message to the thread
    const createdMessage = await openai.beta.threads.messages
      .create(threadId, {
        role: 'user',
        content: message,
      })
      .catch(() => {
        throw new ActionError('error', 500, 'Failed to send message to the assistant. Please try again later.');
      });

    await Logger.withTag(`thread|${threadId}`).withTag(`user|${authSession.user?.id}`).info(`User is chatting with the assistant.`);

    // Run the assistant on the thread
    const runStream = openai.beta.threads.runs.stream(threadId, {
      assistant_id: BAKA_ASSISTANT_ID,
    });

    /**
     * Start Assistant Response
     */
    return AssistantResponse({ threadId, messageId: createdMessage.id }, async (process) => {
      const { forwardStream, sendDataMessage } = process;

      // forward run status would stream message deltas
      let runResult = await forwardStream(runStream);

      // status can be: queued, in_progress, requires_action, cancelling, cancelled, failed, completed, or expired
      while (runResult?.status === 'requires_action' && runResult.required_action?.type === 'submit_tool_outputs') {
        const tool_outputs = await actionToolCalls(
          authSession,
          threadId,
          {
            Cookie: `${APP_SESSION_COOKIE_NAME}=${bakaSessionCookie?.value}`,
          },
          runResult.required_action.submit_tool_outputs.tool_calls,
          sendDataMessage
        );

        // https://platform.openai.com/docs/assistants/tools/function-calling/quickstart
        const newStream = openai.beta.threads.runs.submitToolOutputsStream(threadId, runResult.id, {
          tool_outputs,
          stream: true,
        });

        runResult = await forwardStream(newStream);
      }
    });
  });
}
