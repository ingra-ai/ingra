import { getBaseSwaggerSpec } from './getBaseSwaggerSpec';
import SwaggerDocs from './SwaggerDocs';
import '@css/swagger.scss';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const swaggerSpec = await getBaseSwaggerSpec(true);

  return (
    <section className="container">
      <SwaggerDocs spec={swaggerSpec} />
    </section>
  );
}
