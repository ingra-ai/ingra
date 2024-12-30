import { generateUuid } from "@repo/shared/lib/utils";

import { Chat } from "@/components/custom/chat";

type Props = {
  params: Promise<{ chatId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function Page(props: Props) {
  const { params, searchParams } = props;
  const newUuid = generateUuid();
  return <Chat key={newUuid} id={newUuid} initialMessages={[]} />;
}