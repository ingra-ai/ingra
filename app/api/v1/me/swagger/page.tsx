import SwaggerDocs from '@app/api/(internal)/swagger/SwaggerDocs';
import { getAuthSwaggerSpec } from './config';
import {  APP_SESSION_COOKIE_NAME } from '@lib/constants';

import '@css/swagger.scss';
import { getWebAuthSession } from '@app/auth/session/caches';
import { cookies } from 'next/headers';

export default async function Page() {
  const cookieStore = cookies();
  const jwt = cookieStore.get(APP_SESSION_COOKIE_NAME)?.value;
  const sessionWithUser = await getWebAuthSession(jwt || '');

  if ( !sessionWithUser ) {
    return <></>;
  }

  const swaggerSpec = await getAuthSwaggerSpec(sessionWithUser);

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
