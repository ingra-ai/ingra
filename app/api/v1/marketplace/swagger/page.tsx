import SwaggerDocs from '@app/api/(internal)/swagger/SwaggerDocs';
import { getMarketplaceSwaggerSpec } from './config';

import '@css/swagger.scss';
import { getAuthSession } from '@app/auth/session';

export default async function Page() {
  const authSession = await getAuthSession();
  if ( !authSession ) {
    return (<></>);
  }

  const swaggerSpec = await getMarketplaceSwaggerSpec(authSession);

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
