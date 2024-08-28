import SwaggerDocs from "./SwaggerDocs";
import { getSwaggerSpec } from "./config";

import "@css/swagger.scss";

export default async function Page() {
  const swaggerSpec = await getSwaggerSpec(true);

  return (
    <section className="container">
      <SwaggerDocs spec={swaggerSpec} />
    </section>
  );
}
