import { getAuthSession } from '@repo/shared/data/auth/session';
import { APP_AUTH_LOGIN_URL } from '@repo/shared/lib/constants';
import { headers } from 'next/headers';
import { RedirectType, redirect } from 'next/navigation';

import { Chat } from "@/components/custom/chat";
import { generateUUID } from "@/lib/utils";



export default async function Page({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  const authSession = await getAuthSession();
  const headersList = headers(),
    headerUrl = headersList.get('X-URL') || '',
    redirectToQuery = headerUrl ? `?redirectTo=${encodeURIComponent(headerUrl)}` : '';

  if (!authSession) {
    return redirect(APP_AUTH_LOGIN_URL + redirectToQuery, RedirectType.replace);
  }

  const newUuid = generateUUID();
  return <Chat key={newUuid} id={newUuid} initialMessages={[]} />;
}