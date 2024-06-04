import { getAuthSession } from '@app/auth/session';
import { AssistantForm } from '@components/ai/AssistantForm';
import { BAKA_ASSISTANT_USER_THREAD_COOKIE_NAME } from '@lib/constants';
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
    <div className="block container" data-testid="assistants-page">
      <div className="max-w-prose mx-auto">
        <h3 className="text-base font-semibold leading-10 mb-4">
          <BotMessageSquareIcon className="inline-block mr-2 w-4 h-4" />
          Baka Assistant
        </h3>
        <AssistantForm
          authSession={authSession}
          threadId={assistantThreadId}
          className="text-balance h-[85vh] w-full"
        />
      </div>
    </div>
  );
}
