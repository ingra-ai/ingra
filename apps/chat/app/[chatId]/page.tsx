import { CoreMessage, CoreToolMessage, Message, ToolInvocation } from "ai";
import { notFound } from "next/navigation";
import { Chat as PreviewChat } from "@/components/custom/chat";
import { getChatById } from "@repo/shared/data/chat";
import type { Chat } from "@repo/db/prisma";
import { generateUUID } from "@/lib/utils";
import { getAuthSession } from "@repo/shared/data/auth/session";

function addToolMessageToChat({
  toolMessage,
  messages,
}: {
  toolMessage: CoreToolMessage;
  messages: Array<Message>;
}): Array<Message> {
  return messages.map((message) => {
    if (message.toolInvocations) {
      return {
        ...message,
        toolInvocations: message.toolInvocations.map((toolInvocation) => {
          const toolResult = toolMessage.content.find(
            (tool) => tool.toolCallId === toolInvocation.toolCallId,
          );

          if (toolResult) {
            return {
              ...toolInvocation,
              state: "result",
              result: toolResult.result,
            };
          }

          return toolInvocation;
        }),
      };
    }

    return message;
  });
}

function convertToUIMessages(messages: Array<CoreMessage>): Array<Message> {
  return messages.reduce((chatMessages: Array<Message>, message) => {
    if (message.role === "tool") {
      return addToolMessageToChat({
        toolMessage: message as CoreToolMessage,
        messages: chatMessages,
      });
    }

    let textContent = "";
    let toolInvocations: Array<ToolInvocation> = [];

    if (typeof message.content === "string") {
      textContent = message.content;
    } else if (Array.isArray(message.content)) {
      for (const content of message.content) {
        if (content.type === "text") {
          textContent += content.text;
        } else if (content.type === "tool-call") {
          toolInvocations.push({
            state: "call",
            toolCallId: content.toolCallId,
            toolName: content.toolName,
            args: content.args,
          });
        }
      }
    }

    chatMessages.push({
      id: generateUUID(),
      role: message.role,
      content: textContent,
      toolInvocations,
    });

    return chatMessages;
  }, []);
}

export default async function Page({ params }: { params: any }) {
  const { id } = params;
  const authSession = await getAuthSession();

  if ( !authSession ) {
    return notFound();
  }

  const chatFromDb = await getChatById(id, authSession.userId);

  if (!chatFromDb) {
    notFound();
  }

  // type casting
  const chat = {
    ...chatFromDb,
    messages: convertToUIMessages(chatFromDb.messages as Array<CoreMessage>),
  };

  return <PreviewChat id={chat.id} initialMessages={chat.messages} />;
}