'use client';
import { type FC, type HTMLAttributes, useRef, useEffect, useState, ChangeEvent, KeyboardEvent } from 'react';
import { Message, useAssistant } from 'ai/react';
import { ArrowRightIcon, LoaderIcon, UserIcon, XIcon, BotMessageSquareIcon } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { ScrollArea } from '@components/ui/scroll-area';
import { AuthSessionResponse } from '@app/auth/session/types';
import { cn } from '@lib/utils';

import 'highlight.js/styles/github-dark.css';

type AssistantFormProps = HTMLAttributes<HTMLDivElement> & {
  authSession: AuthSessionResponse;
};

export const AssistantForm: FC<AssistantFormProps> = (props) => {
  const { authSession, ...rest } = props;
  const { status, messages, input, submitMessage, handleInputChange, stop, setMessages } = useAssistant({
    api: '/api/v1/me/assistants',

  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    setLoading(true);

    fetch('/api/v1/me/assistants', {
      method: 'GET'
    })
      .then(response => {
        if (response.ok) {
          return response.json();
        }

        return {};
      })
      .then( ( response ) => {
        const { data } = ( response || {} ) as { data: { threadId: string, messages: Message[] } };
        if (Array.isArray(data?.messages)) {
          setMessages(data.messages);
        }
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [])

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      if (status === 'awaiting_message') {
        submitMessage();
      }
    }
  };

  const userName = authSession.user?.profile?.userName || 'You';

  const handleTextareaChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    handleInputChange(event);
    const textarea = event.target;
    textarea.style.height = 'auto'; // Reset the height
    textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`; // Set the height based on content, max height is 150px
  };

  return (
    <div
      {...rest}
      className="h-full w-full flex flex-col bg-gray-900"
      data-testid="assistant-form"
    >
      <ScrollArea className="flex-1 rounded-sm border p-4 text-sm">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <LoaderIcon className="animate-spin w-10 h-10 mx-auto" />
          </div>
        ) : (
          messages.map((m: Message) => {
            const messageUserName = m.role === 'user' ? userName : 'Assistant';
            return (
              <div
                key={m.id}
                className={cn('p-3 rounded-sm [&:not(:last-child)]:mb-4', {
                  'bg-blue-600 self-end': m.role === 'user',
                  'bg-gray-700 self-start': m.role === 'assistant'
                })}
              >
                <div className="flex items-center space-x-2">
                  {m.role === 'user' ? <UserIcon className="w-5 h-5" /> : <BotMessageSquareIcon className="w-5 h-5" />}
                  <strong>{messageUserName}: </strong>
                </div>
                <div className="mt-1">
                  {m.role !== 'data' && (
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeHighlight]}
                      className="prose prose-sm prose-invert"
                    >
                      {m.content}
                    </ReactMarkdown>
                  )}
                  {m.role === 'data' && (
                    <>
                      <p>{(m.data as any).description}</p>
                      <pre className="bg-gray-800 p-2 rounded-sm">
                        {JSON.stringify(m.data, null, 2)}
                      </pre>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </ScrollArea>

      {status === 'in_progress' && (
        <div className="p-4">
          <LoaderIcon className="animate-spin w-5 h-5 mx-auto" />
        </div>
      )}

      <form onSubmit={submitMessage} className="bg-gray-800 p-2 flex items-center space-x-2">
        <textarea
          disabled={status !== 'awaiting_message'}
          value={input}
          placeholder="Type your message..."
          onChange={handleTextareaChange}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-gray-700 p-2 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
          rows={1}
          style={{ height: 'auto', maxHeight: '150px' }} // Initial height and max height
        />
        {status === 'awaiting_message' ? (
          <button
            type="submit"
            className="p-2 bg-blue-600 rounded-sm disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={status !== 'awaiting_message'}
          >
            <ArrowRightIcon className="w-5 h-5" />
          </button>
        ) : (
          <button
            type="button"
            className="p-2 bg-red-600 rounded-sm"
            onClick={stop}
          >
            <XIcon className="w-5 h-5" />
          </button>
        )}
      </form>
    </div>
  );
};
