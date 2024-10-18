import { getAuthSession } from "@repo/shared/data/auth/session";
import { getChatById } from "@repo/shared/data/chat";
import { isUuid } from "@repo/shared/lib/utils";
import { CoreMessage } from "ai";
import { notFound } from "next/navigation";

import { Chat as PreviewChat } from "@/components/custom/chat";
import { convertToUIMessages } from "@/lib/utils";


type Props = {
  params: { chatId: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export default async function Page(props: Props) {
  const { params, searchParams } = props;
  const { chatId } = params;
  const authSession = await getAuthSession();

  if ( !authSession || !isUuid(chatId) ) {
    return notFound();
  }

  const chatFromDb = await getChatById<CoreMessage>(chatId, authSession.userId);

  if (chatFromDb) {
    const chat = {
      ...chatFromDb,
      messages: convertToUIMessages(chatFromDb.messages),
    };

    return <PreviewChat key={chat.id} id={chat.id} initialMessages={chat.messages} />;
  }
  else {
    return <PreviewChat key={chatId} id={chatId} initialMessages={[]} />;
  }
}