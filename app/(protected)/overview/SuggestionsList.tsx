import { AuthSessionResponse } from "@app/auth/session";
import { CogIcon } from 'lucide-react';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import Link from "next/link";
import { APP_SETTINGS_PROFILE_URI, APP_SETTINGS_API_URI, APP_SETTINGS_ENV_VARS_URI } from "@lib/constants";
import { cn } from "@lib/utils";

type SuggestionsListProps = {
  authSession: AuthSessionResponse;
  totalApiKeys: number;
  className?: string;
}

export const SuggestionsList: React.FC<SuggestionsListProps> = (props) => {
  const { authSession, totalApiKeys = 0, className } = props;
  const { user: { profile, oauthTokens, envVars } } = authSession;

  const allConcerns = [];

  const classes = cn('block space-y-2', className);

  if ( !profile?.userName ) {
    allConcerns.push(
      <p className="text-sm font-medium">
        It&apos;s important to have a <code className="text-orange-400">username</code> configured for your account to have seamless experience with your GPT. You can set your <code>username</code> by&nbsp;
        <Link className='underline underline-offset-2 hover:text-orange-300' href={APP_SETTINGS_PROFILE_URI}>visiting your profile page</Link>.
      </p>
    );
  }

  if ( !oauthTokens.length ) {
    allConcerns.push(
      <p className="text-sm font-medium">
        Note that some functions require <code className="text-orange-400">Google integration</code> to work properly. You can integrate Google by visiting&nbsp;
        <Link className='underline underline-offset-2 hover:text-orange-300' href={APP_SETTINGS_PROFILE_URI}>visiting your profile page</Link>.
      </p>
    );
  }

  if ( !totalApiKeys ) {
    allConcerns.push(
      <p className="text-sm font-medium">
        You have {totalApiKeys} <code className="text-orange-400">API keys</code> created. Applications like <strong>ChatGPT</strong> require API keys to communicate with your account. You can manage your API keys by&nbsp;<Link className='underline underline-offset-2 hover:text-orange-300' href={APP_SETTINGS_API_URI}>visiting your profile page</Link>.
      </p>
    );
  }

  if ( !envVars.length ) {
    allConcerns.push(
      <p className="text-sm font-medium">
        You have {envVars.length} <code className="text-orange-400">environment variables</code> set. These variables are usually required to run some functions. You can manage your environment variables by&nbsp;<Link className='underline underline-offset-2 hover:text-orange-300' href={APP_SETTINGS_ENV_VARS_URI}>visiting your profile page</Link>. Ignore this if you do not have any functions that require environment variables.
      </p>
    );
  }

  return (
    <div className={ classes } data-testid='suggestions-list'>
      {
        allConcerns.length > 0 && (
          <Alert>
            <CogIcon className="h-4 w-4" />
            <AlertTitle className="mb-4">Some settings need your attention!</AlertTitle>
            <AlertDescription>
              <ul role="list" className="flex flex-col min-w-full text-sm font-semibold space-y-1 text-gray-300">
                {allConcerns.map((concern, index) => (
                  <li className="list-decimal list-outside" key={index}>{concern}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )
      }
    </div>
  );

};