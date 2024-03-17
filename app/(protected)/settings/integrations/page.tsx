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
      <div className="my-4 xl:my-6">
        <GoogleButtonUI type="redirect" text="Google Calendar Connect" />
      </div>

      <div className="my-4 xl:my-6">
        <OAuthList oAuthTokens={oAuthTokens} />
      </div>
    </div>
  );
}
