"use client";

import { useScrollToBottom } from "@repo/components/custom";
import { ScrollArea } from "@repo/components/ui/scroll-area";
import { useChat } from "ai/react";
import { useState } from "react";

import { Message as PreviewMessage } from "@/components/custom/message";
import { getChatUri } from "@/lib/constants";
import { Attachment, Message } from "ai";

import { MultimodalInput } from "./multimodal-input";
import { Overview } from "./overview";

export function Chat({
  id,
  initialMessages,
}: {
  id: string;
  initialMessages: Array<Message>;
}) {
  const { messages, handleSubmit, input, setInput, append, isLoading, stop } =
    useChat({
      body: { id },
      api: "/api/v1/chat",
      initialMessages,
      onFinish: () => {
        window.history.replaceState({}, "", getChatUri(id));
      },
    });

  const [messagesContainerRef, messagesEndRef] = useScrollToBottom<HTMLDivElement>();
  const [attachments, setAttachments] = useState<Array<Attachment>>([]);

  return (
    <>
      <ScrollArea
        ref={messagesContainerRef}
        className="w-full h-full"
      >
        <div className="flex flex-col gap-4 items-center">
          {messages.length === 0 && <Overview />}

          {messages.map((message, index) => (
            <PreviewMessage
              key={`${id}-${index}`}
              role={message.role}
              content={message.content}
              attachments={message.experimental_attachments}
              toolInvocations={message.toolInvocations}
            />
          ))}
          <div
            ref={messagesEndRef}
            className="shrink-0 min-w-[24px] min-h-[24px]"
          />

        </div>
      </ScrollArea>

      <form className="flex flex-row gap-2 relative items-end w-full md:max-w-[500px] max-w-[calc(100dvw-32px) px-4 md:px-0">
        <MultimodalInput
          input={input}
          setInput={setInput}
          handleSubmit={handleSubmit}
          isLoading={isLoading}
          stop={stop}
          attachments={attachments}
          setAttachments={setAttachments}
          messages={messages}
          append={append}
        />
      </form>
    </>
  );
}