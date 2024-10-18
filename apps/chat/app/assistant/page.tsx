import { AssistantForm } from '@repo/components/ai/AssistantForm';
import { ChatForm } from '@repo/components/ai/ChatForm';
import { getAuthSession } from '@repo/shared/data/auth/session';
import { BAKA_ASSISTANT_NAME, BAKA_ASSISTANT_USER_THREAD_COOKIE_NAME, ME_API_ROOT_PATH } from '@repo/shared/lib/constants';
import { BotMessageSquareIcon } from 'lucide-react';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';

type Props = {
  params: { paths: string[] };
  searchParams: { [key: string]: string | string[] | undefined };
};

export default async function Page(props: Props) {
  const { params, searchParams } = props;
  const authSession = await getAuthSession();

  if (!authSession) {
    return notFound();
  }

  const cookieStore = cookies();
  const assistantThreadId = cookieStore.get(BAKA_ASSISTANT_USER_THREAD_COOKIE_NAME)?.value;

  return (
    <div className="block h-full w-full" data-testid="assistants-page">
      {/* <h3 className="text-base font-semibold leading-10 mb-4">
        <BotMessageSquareIcon className="inline-block mr-2 w-4 h-4" />
        { BAKA_ASSISTANT_NAME }
      </h3> */}
      {/* <ChatForm authSession={authSession} api={ME_API_ROOT_PATH + '/chat'} threadId={assistantThreadId} className="text-balance h-full w-full" /> */}
      <AssistantForm
        authSession={authSession}
        threadId={assistantThreadId}
        className="text-balance h-full w-full"
      />
    </div>
  );
}
