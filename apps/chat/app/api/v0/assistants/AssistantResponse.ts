import { BAKA_ASSISTANT_USER_THREAD_COOKIE_NAME, BAKA_ASSISTANT_USER_THREAD_COOKIE_MAX_AGE } from '@repo/shared/lib/constants';
import { type AssistantResponse as VercelAssistantResponse, AssistantMessage, formatAssistantStreamPart, formatDataStreamPart, DataMessage } from 'ai';

import type { AssistantStream } from 'openai/lib/AssistantStream.mjs';
import type { Run } from 'openai/resources/beta/threads/runs/runs.mjs';

type AssistantResponseSettings = Parameters<typeof VercelAssistantResponse>[0];
type AssistantResponseCallback = Parameters<typeof VercelAssistantResponse>[1];

/**
The `AssistantResponse` allows you to send a stream of assistant update to `useAssistant`.
It is designed to facilitate streaming assistant responses to the `useAssistant` hook.
It receives an assistant thread and a current message, and can send messages and data messages to the client.
 */
export function AssistantResponse({ threadId, messageId }: AssistantResponseSettings, process: AssistantResponseCallback): Response {
  const stream = new ReadableStream({
    async start(controller) {
      const textEncoder = new TextEncoder();

      const sendMessage = (message: AssistantMessage) => {
        controller.enqueue(textEncoder.encode(formatAssistantStreamPart('assistant_message', message)));
      };

      const sendDataMessage = (message: DataMessage) => {
        controller.enqueue(textEncoder.encode(formatAssistantStreamPart('data_message', message)));
      };

      const sendError = (errorMessage: string) => {
        controller.enqueue(textEncoder.encode(formatAssistantStreamPart('error', errorMessage)));
      };

      const forwardStream = async (stream: AssistantStream) => {
        let result: Run | undefined = undefined;

        for await (const value of stream) {
          switch (value.event) {
            case 'thread.message.created': {
              controller.enqueue(
                textEncoder.encode(
                  formatAssistantStreamPart('assistant_message', {
                    id: value.data.id,
                    role: 'assistant',
                    content: [{ type: 'text', text: { value: '' } }],
                  })
                )
              );
              break;
            }

            case 'thread.message.delta': {
              const content = value.data.delta.content?.[0];

              if (content?.type === 'text' && content.text?.value != null) {
                controller.enqueue(textEncoder.encode(formatAssistantStreamPart('text', content.text.value)));
              }

              break;
            }

            case 'thread.run.requires_action':
            case 'thread.run.completed': {
              result = value.data;
              break;
            }
          }
        }

        return result;
      };

      // send the threadId and messageId as the first message:
      controller.enqueue(
        textEncoder.encode(
          formatAssistantStreamPart('assistant_control_data', {
            threadId,
            messageId,
          })
        )
      );

      try {
        await process({
          // threadId,
          // messageId,
          sendMessage,
          sendDataMessage,
          forwardStream,
        });
      } catch (error) {
        sendError((error as any).message ?? `${error}`);
      } finally {
        controller.close();
      }
    },
    pull(controller) {},
    cancel() {},
  });

  return new Response(stream, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      Connection: 'keep-alive',
      'Cache-Control': 'no-cache',
      'Keep-Alive': 'timeout=30',
      'Set-Cookie': `${BAKA_ASSISTANT_USER_THREAD_COOKIE_NAME}=${threadId}; Path=/; Max-Age=${BAKA_ASSISTANT_USER_THREAD_COOKIE_MAX_AGE}; SameSite=Strict; Secure; HttpOnly`,
    },
  });
}
