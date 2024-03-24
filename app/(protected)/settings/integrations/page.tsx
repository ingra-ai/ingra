import { getAuthSession } from '@app/auth/session';
import { GoogleButtonUI } from './GoogleButtonUI';
import { type OAuthToken } from '@prisma/client';
import db from '@lib/db';
import OAuthList from './OAuthList';

export default async function Page() {
  const authSession = await getAuthSession();
  const oAuthTokens: OAuthToken[] = authSession
    ? await db.oAuthToken.findMany({
      where: {
        userId: authSession.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
    : [];

  return (
    <div className="mt-7 leading-7" data-testid="integrations-page">
      <div className="mt-8 mb-32 xl:my-6">
        <div className="flex justify-center items-center">
          <GoogleButtonUI type="redirect" text="Connect with your Google Account" />
        </div>
      </div>
      <div className="my-4 xl:my-6">
        <OAuthList oAuthTokens={oAuthTokens} />
      </div>
    </div>
  );
}
