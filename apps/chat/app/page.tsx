import { getAuthSession } from '@repo/shared/data/auth/session';
import { APP_AUTH_LOGIN_URL } from '@repo/shared/lib/constants';
import { headers } from 'next/headers';
import { RedirectType, redirect } from 'next/navigation';

import { Chat } from "@/components/custom/chat";
import { generateUUID } from "@/lib/utils";

type Props = {
  params: Promise<Record<string, string | string[] | undefined>>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function Page(props: Props) {
  const authSession = await getAuthSession();
  const headersList = await headers(),
    headerUrl = headersList.get('X-URL') || '',
    redirectToQuery = headerUrl ? `?redirectTo=${encodeURIComponent(headerUrl)}` : '';

  if (!authSession) {
    return redirect(APP_AUTH_LOGIN_URL + redirectToQuery, RedirectType.replace);
  }

  const newUuid = generateUUID();
  return <Chat key={newUuid} id={newUuid} initialMessages={[]} />;
}