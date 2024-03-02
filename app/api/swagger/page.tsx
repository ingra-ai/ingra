import SwaggerDocs from './SwaggerDocs';
import { getSwaggerSpec } from '@/app/api/swagger/config';

import '@css/swagger.scss';

export default async function Page() {
  const swaggerSpec = await getSwaggerSpec();

  return (
    <section className="container">
      <SwaggerDocs spec={swaggerSpec} />
    </section>
  );
}
