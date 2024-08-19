import { getAuthSession } from '@app/auth/session';
import { AssistantForm } from '@components/ai/AssistantForm';
import { ChatForm } from '@components/ai/ChatForm';
import { BAKA_ASSISTANT_NAME, BAKA_ASSISTANT_USER_THREAD_COOKIE_NAME, USER_API_ROOT_PATH } from '@lib/constants';
import { BotMessageSquareIcon } from 'lucide-react';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';

export default async function Page({ params }: { params: { paths: string[] } }) {
  const authSession = await getAuthSession();

  if ( !authSession ) {
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
      <ChatForm
        authSession={authSession}
        api={ USER_API_ROOT_PATH + '/me/chat' }
        threadId={assistantThreadId}
        className="text-balance h-full w-full"
      />
      {/* <AssistantForm
        authSession={authSession}
        threadId={assistantThreadId}
        className="text-balance h-full w-full"
      /> */}
    </div>
  );
}
