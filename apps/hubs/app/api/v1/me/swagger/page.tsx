import { getAuthSession } from '@repo/shared/data/auth/session';
import SwaggerDocs from '@app/api/(internal)/swagger/SwaggerDocs';
import { getAuthSwaggerSpec } from './config';
import { redirect, RedirectType } from 'next/navigation';
import { APP_AUTH_LOGIN_URL } from '@repo/shared/lib/constants';
import { headers } from 'next/headers';

import '@css/swagger.scss';

export default async function Page() {
  const authSession = await getAuthSession();
  const headersList = headers(),
    headerUrl = headersList.get('X-URL') || '',
    redirectToQuery = headerUrl ? `?redirectTo=${encodeURIComponent(headerUrl)}` : '';

  if (!authSession) {
    redirect(APP_AUTH_LOGIN_URL + redirectToQuery, RedirectType.replace);
  }

  const swaggerSpec = await getAuthSwaggerSpec(authSession);

  return (
    <section className="container">
      {swaggerSpec ? (
        <SwaggerDocs spec={swaggerSpec} />
      ) : (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <h1 className="text-2xl font-bold">No Swagger Spec Found</h1>
            <p className="text-gray-600">Please check the username in the URL and try again.</p>
          </div>
        </div>
      )}
    </section>
  );
}
