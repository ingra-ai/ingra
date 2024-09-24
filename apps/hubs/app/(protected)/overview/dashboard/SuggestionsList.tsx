import type { FC } from 'react';
import { CogIcon } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@repo/components/ui/alert';
import Link from 'next/link';
import { HUBS_SETTINGS_PROFILE_URI, HUBS_SETTINGS_APIKEY_URI, HUBS_SETTINGS_ENVVARS_URI, HUBS_SETTINGS_INTEGRATIONS_URI, DOCS_APP_URL } from '@repo/shared/lib/constants';
import { cn } from '@repo/shared/lib/utils';
import { AuthSessionResponse } from '@repo/shared/data/auth/session/types';

type SuggestionsListProps = {
  authSession: AuthSessionResponse;
  totalApiKeys: number;
  className?: string;
};

export const SuggestionsList: FC<SuggestionsListProps> = (props) => {
  const { authSession, totalApiKeys = 0, className } = props;
  const { profile, oauthTokens = [], envVars = [] } = authSession.user || {};

  const allConcerns = [];

  if (!profile?.userName) {
    allConcerns.push(
      <p className="">
        It&apos;s important to have a <code>username</code> configured for your account. You can set your <code>username</code> by&nbsp;
        <Link className="underline underline-offset-2" href={HUBS_SETTINGS_PROFILE_URI}>
          visiting your profile page
        </Link>
        .
      </p>
    );
  }

  if (!oauthTokens.length) {
    allConcerns.push(
      <p className="">
        Note that some functions require <code>Google integration</code> to work properly. You can integrate Google by visiting&nbsp;
        <Link className="underline underline-offset-2" href={HUBS_SETTINGS_INTEGRATIONS_URI}>
          visiting your integrations page
        </Link>
        .
      </p>
    );
  }

  if (!totalApiKeys) {
    allConcerns.push(
      <p className="">
        You have {totalApiKeys} <code>API keys</code> created. Applications like <strong>ChatGPT</strong> require API keys to communicate with your account. You can manage your API keys by&nbsp;
        <Link className="underline underline-offset-2" href={HUBS_SETTINGS_APIKEY_URI}>
          visiting your profile page
        </Link>
        .
      </p>
    );
  }

  if (!envVars.length) {
    allConcerns.push(
      <p className="">
        You have {envVars.length} <code>environment variables</code> set. These variables are usually required to run some functions. You can manage your environment variables by&nbsp;
        <Link className="underline underline-offset-2" href={HUBS_SETTINGS_ENVVARS_URI}>
          visiting your profile page
        </Link>
        . Ignore this if you do not have any functions that require environment variables.
      </p>
    );
  }

  if ( !allConcerns.length ) {
    return null;
  }

  return (
    <Alert className={cn('block space-y-2 bg-warning mb-4', className)} data-testid="suggestions-list">
      <CogIcon className="h-6 w-6 stroke-warning-foreground" />
      <AlertTitle className="mb-4">Some settings need your attention!</AlertTitle>
      <AlertDescription>
        <ul role="list" className="flex flex-col min-w-full text-sm font-semibold space-y-1">
          {allConcerns.map((concern, index) => (
            <li className="list-decimal list-outside font-medium" key={index}>
              {concern}
            </li>
          ))}
        </ul>
      </AlertDescription>
      <AlertDescription>
        <p >
          Read more about it at <a href={ `${DOCS_APP_URL}/docs/getting-started/quick-start-guide/account-setup` } className="underline underline-offset-2">Account Setup | Docs</a>.
        </p>
      </AlertDescription>
    </Alert>
  );
};
