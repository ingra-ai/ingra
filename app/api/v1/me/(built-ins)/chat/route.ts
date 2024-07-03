// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import OpenAI from 'openai';
import { apiAuthTryCatch } from '@app/api/utils/apiAuthTryCatch';
import { APP_SESSION_COOKIE_NAME, BAKA_ASSISTANT_ID, BAKA_ASSISTANT_USER_THREAD_COOKIE_MAX_AGE, BAKA_ASSISTANT_USER_THREAD_COOKIE_NAME, OPENAI_API_KEY } from '@lib/constants';
import { Logger } from '@lib/logger';
import { ActionError } from '@v1/types/api-response';
import { type Message } from 'ai';
import { AssistantResponse } from './AssistantResponse';
import { actionToolCalls } from './toolsHandler';

import { Message as VercelChatMessage, StreamingTextResponse } from "ai";

import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatOpenAI } from "@langchain/openai";
import { Calculator } from "@langchain/community/tools/calculator";
import {
  AIMessage,
  BaseMessage,
  ChatMessage,
  HumanMessage,
  SystemMessage,
} from "@langchain/core/messages";

export const runtime = "edge";

const convertVercelMessageToLangChainMessage = (message: VercelChatMessage) => {
  if (message.role === "user") {
    return new HumanMessage(message.content);
  } else if (message.role === "assistant") {
    return new AIMessage(message.content);
  } else {
    return new ChatMessage(message.content, message.role);
  }
};

const convertLangChainMessageToVercelMessage = (message: BaseMessage) => {
  if (message._getType() === "human") {
    return { content: message.content, role: "user" };
  } else if (message._getType() === "ai") {
    return {
      content: message.content,
      role: "assistant",
      tool_calls: (message as AIMessage).tool_calls,
    };
  } else {
    return { content: message.content, role: message._getType() };
  }
};

const AGENT_SYSTEM_TEMPLATE = `You are a talking parrot named Polly. All final responses must be how a talking parrot would respond. Squawk often!`;
export async function POST(req: NextRequest) {
  try {
    const body = await req.json(),
      { returnIntermediateSteps = false } = body || {};
    /**
     * We represent intermediate steps as system messages for display purposes,
     * but don't want them in the chat history.
     */
    const messages = (body.messages ?? [])
      .filter(
        (message: VercelChatMessage) =>
          message.role === "user" || message.role === "assistant",
      )
      .map(convertVercelMessageToLangChainMessage);

    // Requires process.env.SERPAPI_API_KEY to be set: https://serpapi.com/
    // You can remove this or use a different tool instead.
    const tools = [new Calculator()];
    const chat = new ChatOpenAI({
      model: "gpt-3.5-turbo-0125",
      temperature: 0,
    });

    /**
     * Use a prebuilt LangGraph agent.
     */
    const agent = createReactAgent({
      llm: chat,
      tools,
      /**
       * Modify the stock prompt in the prebuilt agent. See docs
       * for how to customize your agent:
       *
       * https://langchain-ai.github.io/langgraphjs/tutorials/quickstart/
       */
      messageModifier: new SystemMessage(AGENT_SYSTEM_TEMPLATE),
    });

    if (!returnIntermediateSteps) {
      /**
       * Stream back all generated tokens and steps from their runs.
       *
       * We do some filtering of the generated events and only stream back
       * the final response as a string.
       *
       * For this specific type of tool calling ReAct agents with OpenAI, we can tell when
       * the agent is ready to stream back final output when it no longer calls
       * a tool and instead streams back content.
       *
       * See: https://langchain-ai.github.io/langgraphjs/how-tos/stream-tokens/
       */
      const eventStream = await agent.streamEvents(
        { messages },
        { version: "v2" },
      );

      const textEncoder = new TextEncoder();
      const transformStream = new ReadableStream({
        async start(controller) {
          for await (const { event, data } of eventStream) {
            if (event === "on_chat_model_stream") {
              // Intermediate chat model generations will contain tool calls and no content
              if (data.chunk.content) {
                controller.enqueue(textEncoder.encode(data.chunk.content));
              }
            }
          }
          controller.close();
        },
      });

      return new StreamingTextResponse(transformStream);
    } else {
      /**
       * We could also pick intermediate steps out from `streamEvents` chunks, but
       * they are generated as JSON objects, so streaming and displaying them with
       * the AI SDK is more complicated.
       */
      const result = await agent.invoke({ messages });
      return NextResponse.json(
        {
          messages: result.messages.map(convertLangChainMessageToVercelMessage),
        },
        { status: 200 },
      );
    }
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.status ?? 500 });
  }
}

/**
 * @ swagger
 * /api/v1/me/chat:
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
export async function POSTxx(request: NextRequest) {
  // Parse the request body
  const { threadId, message } = await request.json();
  const cookieStore = cookies();
  const bakaSessionCookie = cookieStore.get(APP_SESSION_COOKIE_NAME);

  return await apiAuthTryCatch(async (authSession) => {
    if ( !threadId ) {
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
    const createdMessage = await openai.beta.threads.messages.create(threadId, {
      role: 'user',
      content: message,
    }).catch( () => {
      throw new ActionError('error', 500, 'Failed to send message to the assistant. Please try again later.');
    });

    await Logger.withTag(`thread|${threadId}`).withTag(`user|${authSession.user?.id}`).info(`User is chatting with the assistant.`);

    // Run the assistant on the thread
    const runStream = openai.beta.threads.runs.stream(threadId, {
      assistant_id: BAKA_ASSISTANT_ID
    });

    /**
     * Start Assistant Response
     */
    return AssistantResponse(
      { threadId, messageId: createdMessage.id },
      async (process) => {
        const { forwardStream, sendDataMessage } = process;

        // forward run status would stream message deltas
        let runResult = await forwardStream(runStream);

        // status can be: queued, in_progress, requires_action, cancelling, cancelled, failed, completed, or expired
        while (
          runResult?.status === 'requires_action' &&
          runResult.required_action?.type === 'submit_tool_outputs'
        ) {
          const tool_outputs = await actionToolCalls(
            authSession,
            threadId,
            {
              'Cookie': `${APP_SESSION_COOKIE_NAME}=${bakaSessionCookie?.value}`
            },
            runResult.required_action.submit_tool_outputs.tool_calls,
            sendDataMessage
          );

          // https://platform.openai.com/docs/assistants/tools/function-calling/quickstart
          const newStream = openai.beta.threads.runs.submitToolOutputsStream(
            threadId,
            runResult.id,
            {
              tool_outputs,
              stream: true
            },
          );

          runResult = await forwardStream(newStream);
        }
      });

  });
}