import { getAuthSession } from '@app/auth/session';
import { GenerateApiKeyButton } from '@protected/settings/api/GenerateApiKeyButton';
import db from '@lib/db';
import { ApiKeysTable } from './ApiKeysTable';

export default async function Page() {
  const authSession = await getAuthSession();
  const allApiKeys = authSession && await db.apiKey.findMany({
    where: {
      userId: authSession.user.id,
    },
  });

  return (
    <div className="mt-7 leading-7">
      <h2 className="text-base font-semibold leading-7 text-white">Generate Your API Key</h2>
      <p className="mt-1 text-sm leading-5 text-gray-400">Generate an API key for your GPT Plugin <code>X-API-KEY</code> header</p>
      {authSession && (
        <div className="mt-5">
          <GenerateApiKeyButton />
        </div>
      )}

      {/* Table to display all api keys */}
      {allApiKeys && (
        <ApiKeysTable apiKeys={allApiKeys} />
      )}
    </div>
  );
}
