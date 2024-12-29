

import { getAuthSession } from '@repo/shared/data/auth/session';
import { APP_AUTH_LOGIN_URL, APP_NAME } from '@repo/shared/lib/constants';
import { headers } from 'next/headers';
import { redirect, RedirectType } from 'next/navigation';

import { LayoutWithNav } from '@/components/layouts/LayoutWithNav';

import type { Metadata } from 'next';
import type { PropsWithChildren } from 'react';

export const metadata: Metadata = {
  title: APP_NAME,
  description: `${APP_NAME} Chat, unlimited function tool calling AI assistant.`,
  robots: 'noindex, nofollow',
};

export default async function ConfigLayout({ children }: PropsWithChildren) {
  const authSession = await getAuthSession();
  const headersList = await headers(),
    headerUrl = headersList.get('X-URL') || '',
    redirectToQuery = headerUrl ? `?redirectTo=${encodeURIComponent(headerUrl)}` : '';

  if (!authSession) {
    return redirect(APP_AUTH_LOGIN_URL + redirectToQuery, RedirectType.replace);
  }

  return (
    <LayoutWithNav authSession={authSession}>
      {children}
    </LayoutWithNav>
  );
}
