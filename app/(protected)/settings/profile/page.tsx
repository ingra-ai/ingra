

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { getAuthSession } from '@app/auth/session';
import { UserProfileForm } from '@protected/settings/profile/UserProfileForm';
import { notFound } from 'next/navigation';
import { IntegrationsSection } from './IntegrationsSection';
import { DeleteAccountButtonForm } from './DeleteAccountButtonForm';

/**
 * Profile Page
 * @see https://tailwindui.com/components/application-ui/forms/form-layouts
 */

export default async function Page() {
  const authSession = await getAuthSession();

  if (!authSession) {
    return notFound();
  }

  return (
    <div className="container mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-x-16 py-16 w-full">
        <div className="md:col-span-1 text-right">
          <h2 className="text-base font-semibold leading-7 text-white">Integrations</h2>
          <p className="text-sm mt-2 leading-6 text-gray-400">Connect your account with trusted third-party applications such as Google to enhance your experience. Integration allows seamless access to additional features and services while ensuring your data is securely managed and protected.</p>
        </div>
        <div className="md:col-span-2">
          <IntegrationsSection authSession={authSession} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-x-16 py-16 w-full">
        <div className="md:col-span-1 text-right">
          <h2 className="text-base font-semibold leading-7 text-white">Personal Information</h2>
          <p className="text-sm mt-2 leading-6 text-gray-400">View and update your personal details, including your name, and timezone. Keeping your information up-to-date ensures that you receive important notifications and improves your user experience.</p>
        </div>
        <div className="md:col-span-2">
          <UserProfileForm authSession={authSession} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 py-16 w-full">
        <div className="md:col-span-1 text-right">
          <h2 className="text-base font-semibold leading-7 text-white">Log out other sessions</h2>
          <p className="text-sm mt-2 leading-6 text-gray-400">Secure your account by logging out of all other active sessions. This action will terminate access from all devices except the one you are currently using, protecting your information from unauthorized access.</p>
        </div>

        <div className="md:col-span-1">
          <div className="block">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger type="button" className="rounded-md bg-gray-500 px-3 py-2 text-sm font-semibold text-white shadow-sm">
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
          <h2 className="text-base font-semibold leading-7 text-white">Delete account</h2>
          <p className="text-sm mt-2 leading-6 text-gray-400">Permanently delete your account and all associated data. This action cannot be undone. If you proceed, your personal information, preferences, and history will be irretrievably removed in accordance with our data retention policy</p>
        </div>

        <div className="md:col-span-1">
          <DeleteAccountButtonForm />
        </div>
      </div>
    </div>
  );
}
