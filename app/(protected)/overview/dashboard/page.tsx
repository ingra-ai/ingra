import { getAuthSession } from '@app/auth/session';
import { APP_AUTH_LOGIN_URL, APP_SETTINGS_API_URI, APP_SETTINGS_INTEGRATIONS_URI } from '@lib/constants';
import { redirect, RedirectType } from 'next/navigation';
import { SuggestionsList } from './SuggestionsList';
import { LayoutDashboardIcon } from 'lucide-react';
import { KeyIcon, SquareFunctionIcon, LibraryIcon, KeyRoundIcon } from 'lucide-react';
import db from '@lib/db';
import { StatCard } from './StatCard';

export default async function Dashboard() {
  const authSession = await getAuthSession();

  if (!authSession) {
    redirect(APP_AUTH_LOGIN_URL, RedirectType.replace);
  }

  const { user: { id: userId, profile, oauthTokens } } = authSession;

  const [totalApiKeys, totalOAuthTokens, totalFunctions, totalCollections, totalSubscribedFunctions, totalSubscribedCollections] = await Promise.all([
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
      <div className="space-y-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-8">
          <StatCard
            id="totalApiKeys"
            name="API Keys"
            icon={KeyRoundIcon}
            stats={[
              {
                name: 'Mine',
                stat: totalApiKeys.toLocaleString(undefined, { minimumFractionDigits: 0 }),
                href: APP_SETTINGS_API_URI,
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
                stat: totalOAuthTokens.toLocaleString(undefined, { minimumFractionDigits: 0 }),
                href: APP_SETTINGS_INTEGRATIONS_URI,
                linkText: 'Manage OAuth Integrations',
              },
            ]}
          />
          <StatCard
            id="totalFunctions"
            name="Functions"
            icon={SquareFunctionIcon}
            stats={[
              {
                name: 'Mine',
                stat: totalFunctions.toLocaleString(undefined, { minimumFractionDigits: 0 }),
                href: '/mine/functions',
              },
              {
                name: 'Subscribed',
                stat: totalSubscribedFunctions.toLocaleString(undefined, { minimumFractionDigits: 0 }),
                href: totalSubscribedFunctions > 0 ? '/subscriptions/functions' : '/marketplace/functions',
                linkText: totalSubscribedFunctions > 0 ? 'View all' : 'Visit Marketplace',
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
                stat: totalCollections.toLocaleString(undefined, { minimumFractionDigits: 0 }),
                href: '/mine/collections',
              },
              {
                name: 'Subscribed',
                stat: totalSubscribedCollections.toLocaleString(undefined, { minimumFractionDigits: 0 }),
                href: totalSubscribedCollections > 0 ? '/subscriptions/collections' : '/marketplace/collections',
                linkText: totalSubscribedCollections > 0 ? 'View all' : 'Visit Marketplace',
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
