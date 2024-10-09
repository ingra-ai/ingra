import { getAuthSession } from '@repo/shared/data/auth/session';
import { RedirectType, redirect } from 'next/navigation';
import { APP_AUTH_LOGIN_URL } from '@repo/shared/lib/constants';
import { IntegrationsSection } from './IntegrationsSection';
import { APP_NAME } from '@repo/shared/lib/constants';
import type { Metadata } from 'next';
import { GoogleIntegrationButton } from '@repo/components/GoogleIntegrationButton';
import { headers } from 'next/headers';

export const metadata: Metadata = {
  title: ['Integrations', APP_NAME].join(' | '),
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
          <h2 className="text-base font-semibold leading-7 dark:text-gray-100 text-gray-900">Integrations</h2>
          <p className="text-sm mt-2 leading-6 dark:text-gray-400 text-gray-600">
            Connect your account with trusted third-party applications such as Google to enhance your experience. Integration allows seamless access to additional features and services while ensuring your data is securely managed and
            protected.
          </p>

          <hr className="my-5" />
          <div className="space-y-5">
            <GoogleIntegrationButton type="redirect" text="Connect with your Google Account" />
          </div>
        </div>
        <div className="md:col-span-2">
          <IntegrationsSection authSession={authSession} />
        </div>
      </div>
    </div>
  );
}
