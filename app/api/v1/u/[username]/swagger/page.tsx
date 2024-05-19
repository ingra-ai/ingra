import { getAuthSession } from '@app/auth/session';
import SwaggerDocs from './SwaggerDocs';
import { getAuthSwaggerSpec } from './config';
import { redirect, RedirectType } from 'next/navigation';
import { APP_AUTH_LOGIN_URL } from '@lib/constants';

import '@css/swagger.scss';

export default async function Page() {
  const authSession = await getAuthSession();

  if (!authSession || authSession.expiresAt < new Date()) {
    redirect(APP_AUTH_LOGIN_URL, RedirectType.replace);
  }

  const swaggerSpec = await getAuthSwaggerSpec(authSession);

  return (
    <section className="container">
      {
        swaggerSpec ? (
          <SwaggerDocs spec={swaggerSpec} />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <h1 className="text-2xl font-bold">No Swagger Spec Found</h1>
              <p className="text-gray-600">Please check the username in the URL and try again.</p>
            </div>
          </div>
        )
      }
    </section>
  );
}
