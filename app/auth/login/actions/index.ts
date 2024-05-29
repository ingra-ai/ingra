'use server';

import { nanoid } from 'ai';
import { createStreamableUI } from 'ai/rsc';
import { OpenAI } from 'openai';
import { ReactNode } from 'react';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface ClientMessage {
  id: string;
  status: ReactNode;
  text: ReactNode;
}

const ASSISTANT_ID = 'asst_XXXXXXXX';
let THREAD_ID = '';
let RUN_ID = '';

export async function getAnswer(question: string): Promise<ClientMessage> {
  const status = createStreamableUI('thread.init');
  const text = createStreamableUI('');

  const runQueue = [];

  (async () => {
    if (THREAD_ID) {
      await openai.beta.threads.messages.create(THREAD_ID, {
        role: 'user',
        content: question,
      });

      const run = await openai.beta.threads.runs.create(THREAD_ID, {
        assistant_id: ASSISTANT_ID,
        stream: true,
      });

      runQueue.push({ id: nanoid(), run });
    }
    else {
      const run = await openai.beta.threads.createAndRun({
        assistant_id: ASSISTANT_ID,
        stream: true,
        thread: {
          messages: [{ role: 'user', content: question }],
        },
      });

      runQueue.push({ id: nanoid(), run });
    }

    while (runQueue.length > 0) {
      const latestRun = runQueue.shift();

      if (latestRun) {
        for await (const delta of latestRun.run) {
          const { data, event } = delta;

          status.update(event);

          if (event === 'thread.created') {
            THREAD_ID = data.id;
          } else if (event === 'thread.run.created') {
            RUN_ID = data.id;
          } else if (event === 'thread.message.delta') {
            data.delta.content?.map(part => {
              if (part.type === 'text') {
                if (part.text) {
                  text.append(part.text.value);
                }
              }
            });
          } else if (event === 'thread.run.failed') {
            console.log(data);
          }
        }
      }
    }

    status.done();
    text.done();
  })();

  return {
    id: nanoid(),
    status: status.value,
    text: text.value,
  };
}