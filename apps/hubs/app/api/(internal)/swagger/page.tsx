import { getSwaggerSpec } from './config';
import SwaggerDocs from './SwaggerDocs';

import '@css/swagger.scss';

export default async function Page() {
  const swaggerSpec = await getSwaggerSpec(true);

  return (
    <section className="container">
      <SwaggerDocs spec={swaggerSpec} />
    </section>
  );
}
