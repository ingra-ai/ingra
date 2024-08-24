'use client';
import { type FC, type HTMLAttributes, useRef, useEffect, ChangeEvent, KeyboardEvent } from 'react';
import { Message, useChat } from 'ai/react';
import { ArrowRightIcon, LoaderIcon, UserIcon, XIcon, BotMessageSquareIcon } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { ScrollArea } from '@components/ui/scroll-area';
import { AuthSessionResponse } from '@data/auth/session/types';
import { cn } from '@lib/utils';

import 'highlight.js/styles/github-dark.css';
import { BAKA_ASSISTANT_NAME } from '@lib/constants';

type ChatFormProps = HTMLAttributes<HTMLDivElement> & {
  authSession: AuthSessionResponse;

  /**
   * URL of the API to use for chat.
   * e.g. /api/v1/me/chat
   */
  api: string;
  threadId?: string;
};

export const ChatForm: FC<ChatFormProps> = (props) => {
  const { authSession, api, threadId, ...rest } = props;
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { messages, input, setInput, handleInputChange, handleSubmit, isLoading: loading, setMessages } = useChat({
    api,
    streamMode: 'text'
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleKeyDown = (evt: KeyboardEvent<HTMLTextAreaElement>) => {
    if (evt.key === 'Enter' && !evt.shiftKey) {
      handleSubmit(evt);
    }
  };

  const userName = authSession.user?.profile?.userName || 'You';

  const handleTextareaChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    handleInputChange(event);
    const textarea = event.target;
    textarea.style.height = 'auto'; // Reset the height
    textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`; // Set the height based on content, max height is 150px
  };

  const classes = cn('h-full w-full flex flex-col text-sm p-4', rest.className),
    disableForm = loading;

  return (
    <div
      id='chat-wrapper'
      {...rest}
      className={ classes }
      data-testid="chat-wrapper"
    >
      <ScrollArea className="flex-1">
        <div className="max-w-prose mx-auto h-full">
          { 
            messages.map((m: Message) => {
              const messageUserName = m.role === 'user' ? userName : BAKA_ASSISTANT_NAME;
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
          }
        </div>
        <div ref={messagesEndRef} />
      </ScrollArea>

      {loading && (
        <div className="p-4">
          <LoaderIcon className="animate-spin w-5 h-5 mx-auto" />
        </div>
      )}

      <form onSubmit={handleSubmit} className="py-3 flex items-center space-x-2">
        <textarea
          disabled={disableForm}
          value={input}
          placeholder="Type your message..."
          onChange={handleTextareaChange}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-secondary px-3 py-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          rows={1}
          style={{ height: 'auto', maxHeight: '150px' }} // Initial height and max height
        />
        {!disableForm ? (
          <button
            type="submit"
            className="p-2 bg-blue-600 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={disableForm}
          >
            <ArrowRightIcon className="w-5 h-5" />
          </button>
        ) : (
          <button
            type="button"
            className="p-2 bg-red-600 rounded-full"
            onClick={stop}
          >
            <XIcon className="w-5 h-5" />
          </button>
        )}
      </form>
    </div>
  );
};
