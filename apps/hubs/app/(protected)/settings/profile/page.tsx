import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@repo/components/ui/tooltip';
import { getAuthSession } from '@repo/shared/data/auth/session';
import { UserProfileForm } from '@protected/settings/profile/UserProfileForm';
import { RedirectType, redirect } from 'next/navigation';
import { DeleteAccountButtonForm } from './DeleteAccountButtonForm';
import { APP_AUTH_LOGIN_URL, APP_NAME } from '@repo/shared/lib/constants';
import type { Metadata } from 'next';
import { headers } from 'next/headers';

export const metadata: Metadata = {
  title: ['Profile', APP_NAME].join(' | '),
};

/**
 * Profile Page
 * @see https://tailwindui.com/components/application-ui/forms/form-layouts
 */

export default async function Page() {
  const authSession = await getAuthSession();

  const headersList = headers(),
    headerUrl = headersList.get('X-URL') || '',
    redirectToQuery = headerUrl ? `?redirectTo=${encodeURIComponent(headerUrl)}` : '';

  if (!authSession) {
    redirect(APP_AUTH_LOGIN_URL + redirectToQuery, RedirectType.replace);
  }

  return (
    <div className="container mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-x-16 py-16 w-full">
        <div className="md:col-span-1 text-right">
          <h2 className="text-base font-semibold leading-7 text-gray-900 dark:text-gray-100">Personal Information</h2>
          <p className="text-sm mt-2 leading-6 text-gray-600 hover:text-gray-400">
            View and update your personal details, including your name, and timezone. Keeping your information up-to-date ensures that you receive important notifications and improves your user experience.
          </p>
        </div>
        <div className="md:col-span-2">
          <UserProfileForm authSession={authSession} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 py-16 w-full">
        <div className="md:col-span-1 text-right">
          <h2 className="text-base font-semibold leading-7 text-gray-900 dark:text-gray-100">Log out other sessions</h2>
          <p className="text-sm mt-2 leading-6 text-gray-600 hover:text-gray-400">
            Secure your account by logging out of all other active sessions. This action will terminate access from all devices except the one you are currently using, protecting your information from unauthorized access.
          </p>
        </div>

        <div className="md:col-span-1">
          <div className="block">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger type="button" className="rounded-md bg-gray-500 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-gray-100 shadow-sm">
                  Log out other sessions
                </TooltipTrigger>
                <TooltipContent>
                  <p>This is not supported at the moment</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 py-16 w-full">
        <div className="md:col-span-1 text-right">
          <h2 className="text-base font-semibold leading-7 text-gray-900 dark:text-gray-100">Delete account</h2>
          <p className="text-sm mt-2 leading-6 text-gray-600 hover:text-gray-400">
            Permanently delete your account and all associated data. This action cannot be undone. If you proceed, your personal information, preferences, and history will be irretrievably removed in accordance with our data retention
            policy
          </p>
        </div>

        <div className="md:col-span-1">
          <DeleteAccountButtonForm />
        </div>
      </div>
    </div>
  );
}
