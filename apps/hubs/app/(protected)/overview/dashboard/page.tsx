import { getAuthSession } from '@repo/shared/data/auth/session';
import { APP_AUTH_LOGIN_URL, HUBS_SETTINGS_APIKEY_URI, HUBS_SETTINGS_ENVVARS_URI, HUBS_SETTINGS_INTEGRATIONS_URI } from '@repo/shared/lib/constants';
import { redirect, RedirectType } from 'next/navigation';
import { SuggestionsList } from './SuggestionsList';
import { LayoutDashboardIcon } from 'lucide-react';
import { KeyIcon, SquareFunctionIcon, LibraryIcon, KeyRoundIcon, VariableIcon } from 'lucide-react';
import db from '@repo/db/client';
import { StatCard } from './StatCard';
import { getUserRepoCollectionsUri, getUserRepoFunctionsUri } from '@repo/shared/lib/constants/repo';
import { headers } from 'next/headers';

export default async function Dashboard() {
  const authSession = await getAuthSession();
  const headersList = headers(),
    headerUrl = headersList.get('X-URL') || '',
    redirectToQuery = headerUrl ? `?redirectTo=${encodeURIComponent(headerUrl)}` : '';

  if (!authSession) {
    redirect(APP_AUTH_LOGIN_URL + redirectToQuery, RedirectType.replace);
  }

  const {
    user: { id: userId, profile, oauthTokens },
  } = authSession;

  const [totalEnvVars, totalApiKeys, totalOAuthTokens, totalFunctions, totalCollections, totalSubscribedFunctions, totalSubscribedCollections] = await Promise.all([
    // Fetch the total count of environment variables
    db.envVars.count({
      where: {
        ownerUserId: userId,
      },
    }),

    // Fetch the total count of api keys
    db.apiKey.count({
      where: {
        userId: userId,
      },
    }),

    // Fetch the total count of OAuth tokens
    db.oAuthToken.count({
      where: {
        userId: userId,
      },
    }),

    // Fetch the total count of functions
    db.function.count({
      where: {
        ownerUserId: userId,
      },
    }),

    // Fetch the total count of collections
    db.collection.count({
      where: {
        userId,
      },
    }),

    // Fetch the total count of functions subscriptions
    db.functionSubscription.count({
      where: {
        userId,
      },
    }),

    // Fetch the total count of functions
    db.collectionSubscription.count({
      where: {
        userId,
      },
    }),
  ]);

  return (
    <div className="container mx-auto">
      <h1 className="text-base font-semibold leading-10 mb-4">
        <LayoutDashboardIcon className="inline-block mr-2 w-5 h-5" />
        Dashboard
      </h1>
      <div className="">
        <SuggestionsList className="" authSession={authSession} totalApiKeys={totalApiKeys} />
      </div>
      <div className="space-y-12">
        {/* Configuration & Integration Group */}
        <section>
          <h2 className="text-lg font-bold mb-4">Configuration & Integration</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
            <StatCard
              id="totalEnvVars"
              name="Environment Variables"
              icon={VariableIcon}
              stats={[
                {
                  name: 'Mine',
                  stat: totalEnvVars.toLocaleString(undefined, {
                    minimumFractionDigits: 0,
                  }),
                  href: HUBS_SETTINGS_ENVVARS_URI,
                  linkText: 'Manage Environment Variables',
                },
              ]}
            />
            <StatCard
              id="totalApiKeys"
              name="API Keys"
              icon={KeyRoundIcon}
              stats={[
                {
                  name: 'Mine',
                  stat: totalApiKeys.toLocaleString(undefined, {
                    minimumFractionDigits: 0,
                  }),
                  href: HUBS_SETTINGS_APIKEY_URI,
                  linkText: 'Manage API Keys',
                },
              ]}
            />
            <StatCard
              id="totalOAuthTokens"
              name="OAuth"
              icon={KeyIcon}
              stats={[
                {
                  name: 'Integrated Apps',
                  stat: totalOAuthTokens.toLocaleString(undefined, {
                    minimumFractionDigits: 0,
                  }),
                  href: HUBS_SETTINGS_INTEGRATIONS_URI,
                  linkText: 'Manage OAuth Integrations',
                },
              ]}
            />
          </div>
        </section>

        {/* Functions & Collections Group */}
        <section>
          <h2 className="text-lg font-bold mb-4">My Repository</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
            <StatCard
              id="totalFunctions"
              name="Functions"
              icon={SquareFunctionIcon}
              stats={[
                {
                  name: 'Mine',
                  stat: totalFunctions.toLocaleString(undefined, {
                    minimumFractionDigits: 0,
                  }),
                  href: getUserRepoFunctionsUri(profile?.userName || ''),
                },
                {
                  name: 'Subscribed',
                  stat: totalSubscribedFunctions.toLocaleString(undefined, {
                    minimumFractionDigits: 0,
                  }),
                  href: '/marketplace/functions',
                  linkText: 'Visit Marketplace',
                },
              ]}
            />
            <StatCard
              id="totalCollections"
              name="Collections"
              icon={LibraryIcon}
              stats={[
                {
                  name: 'Mine',
                  stat: totalCollections.toLocaleString(undefined, {
                    minimumFractionDigits: 0,
                  }),
                  href: getUserRepoCollectionsUri(profile?.userName || ''),
                },
                {
                  name: 'Subscribed',
                  stat: totalSubscribedCollections.toLocaleString(undefined, {
                    minimumFractionDigits: 0,
                  }),
                  href: '/marketplace/collections',
                  linkText: 'Visit Marketplace',
                },
              ]}
            />
          </div>
        </section>
      </div>
      <div className="space-y-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-8">
        </div>
      </div>
    </div>
  );
}
