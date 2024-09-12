import { getAuthSession } from '@repo/shared/data/auth/session';
import db from '@repo/db/client';
import { ApiKeysTable } from './ApiKeysTable';
import { RedirectType, redirect } from 'next/navigation';
import { APP_AUTH_LOGIN_URL } from '@repo/shared/lib/constants';
import { APP_NAME } from '@repo/shared/lib/constants';
import type { Metadata } from 'next';
import { headers } from 'next/headers';

export const metadata: Metadata = {
  title: ['API Keys', APP_NAME].join(' | '),
};

export default async function Page() {
  const authSession = await getAuthSession();
  const headersList = headers(),
    headerUrl = headersList.get('X-URL') || '',
    redirectToQuery = headerUrl ? `?redirectTo=${encodeURIComponent(headerUrl)}` : '';

  if (!authSession) {
    redirect(APP_AUTH_LOGIN_URL + redirectToQuery, RedirectType.replace);
  }

  const allApiKeys = await db.apiKey.findMany({
    where: {
      userId: authSession.user.id,
    },
  });

  return (
    <div className="mt-7 leading-7 container ml-0">
      {/* Table to display all api keys */}
      {allApiKeys && <ApiKeysTable apiKeys={allApiKeys} />}
    </div>
  );
}
