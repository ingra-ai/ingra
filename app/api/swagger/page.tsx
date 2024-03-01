import ReactSwagger from './SwaggerDocs';
import { getSwaggerSpec } from '@/app/api/swagger/config';

import '@css/swagger.scss';

export default async function Page() {
  const swaggerSpec = await getSwaggerSpec();

  return (
    <section className="container">
      <ReactSwagger spec={swaggerSpec} />
    </section>
  );
}
