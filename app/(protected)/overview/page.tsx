import { getAuthSession } from '@app/auth/session';
import { APP_AUTH_LOGIN_URL, USERS_API_ROOT_URL } from '@lib/constants';
import { redirect, RedirectType } from 'next/navigation';
import { SuggestionsList } from './SuggestionsList';
import { ChartBarSquareIcon } from '@heroicons/react/24/outline'
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
    <div className="container mx-auto space-y-4">
      <h1 className="text-base font-semibold leading-10 mb-4">
        <ChartBarSquareIcon className="inline-block mr-2 w-5 h-5" />
        Overview
      </h1>
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
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
      <div className="">
        <SuggestionsList className="" authSession={authSession} totalApiKeys={totalApiKeys} />
      </div>
    </div>
  );
}
