import { getAuthSession } from "@repo/shared/data/auth/session";
import { getChatById } from "@repo/shared/data/chat";
import { generateUuid, isUuid } from "@repo/shared/lib/utils";
import { CoreMessage } from "ai";
import { notFound } from "next/navigation";

import { Chat } from "@/components/custom/chat";
import { convertToUIMessages } from "@/lib/utils";

type Props = {
  params: Promise<{ chatId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function Page(props: Props) {
  const { params, searchParams } = props;
  const [{ chatId }, authSession] = await Promise.all([
    params, 
    getAuthSession()
  ]);

  if ( !authSession ) {
    return notFound();
  }

  if ( isUuid(chatId) ) {
    const chatFromDb = await getChatById<CoreMessage>(chatId, authSession.userId);

    if (chatFromDb) {
      const chat = {
        ...chatFromDb,
        messages: convertToUIMessages(chatFromDb.messages),
      };
  
      return <Chat key={chat.id} id={chat.id} initialMessages={chat.messages} />;
    }
  }

  const newUuid = generateUuid();
  return <Chat key={newUuid} id={newUuid} initialMessages={[]} />;
}