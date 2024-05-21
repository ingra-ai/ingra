import { getAuthSession } from '@app/auth/session';
import { APP_AUTH_LOGIN_URL, USERS_API_ROOT_URL } from '@lib/constants';
import { redirect, RedirectType } from 'next/navigation';
import { SuggestionsList } from './SuggestionsList';
import db from '@lib/db';
import { ApiLinkCard } from './ApiLinkCard';

export default async function Dashboard() {
  const authSession = await getAuthSession();

  if (!authSession) {
    redirect(APP_AUTH_LOGIN_URL, RedirectType.replace);
  }

  const { user: { id, profile, oauthTokens } } = authSession;
  const totalApiKeys = await db.apiKey.count({
    where: {
      userId: id,
    },
  });

  const userOpenApiUrl = USERS_API_ROOT_URL + '/openapi.json';
  const userSwaggerUrl = USERS_API_ROOT_URL + '/swagger';

  return (
    <div className="container mx-auto">
      <h1 className="text-lg mb-6">Overview</h1>
      <SuggestionsList className="mb-6" authSession={authSession} totalApiKeys={totalApiKeys} />

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        <ApiLinkCard
          url={ userOpenApiUrl }
          title="OpenAPI Spec"
          description="Online"
          body="The functions schema that you can pass to your GPT"
        />
        <ApiLinkCard
          url={ userSwaggerUrl }
          title="Swagger URL"
          description="Online"
          body="The playground where you can test your functions"
        />
      </div>
    </div>
  );
}
