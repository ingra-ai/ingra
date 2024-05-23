import SwaggerDocs from '@app/api/(internal)/swagger/SwaggerDocs';
import { getMarketplaceSwaggerSpec } from './config';

import '@css/swagger.scss';

export default async function Page() {
  const swaggerSpec = await getMarketplaceSwaggerSpec();

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