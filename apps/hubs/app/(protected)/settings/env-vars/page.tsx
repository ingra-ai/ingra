import { EnvVarsSection } from '@repo/components/data/envVars/EnvVarsSection';
import db from '@repo/db/client';
import { getAuthSession } from '@repo/shared/data/auth/session';
import { APP_AUTH_LOGIN_URL , APP_NAME } from '@repo/shared/lib/constants';
import { headers } from 'next/headers';
import { RedirectType, redirect } from 'next/navigation';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: ['Environment Variables', APP_NAME].join(' | '),
};

export default async function Page() {
  const authSession = await getAuthSession();
  const headersList = headers(),
    headerUrl = headersList.get('X-URL') || '',
    redirectToQuery = headerUrl ? `?redirectTo=${encodeURIComponent(headerUrl)}` : '';

  if (!authSession) {
    redirect(APP_AUTH_LOGIN_URL + redirectToQuery, RedirectType.replace);
  }

  const allEnvVars = await db.envVars.findMany({
    where: {
      ownerUserId: authSession.user.id,
    },
  });

  return (
    <div className="mt-7 leading-7 container ml-0">
      {/* Table to display all environment variables */}
      {allEnvVars && <EnvVarsSection envVars={allEnvVars} />}
    </div>
  );
}
