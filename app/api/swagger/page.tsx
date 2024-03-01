import { APP_NAME } from '@lib/constants';
import { createSwaggerSpec } from 'next-swagger-doc';
import ReactSwagger from './SwaggerDocs';

import '@css/swagger.scss';

const getApiDocs = async () => {
  const spec = createSwaggerSpec({
    apiFolder: 'app/api', // define api folder under app folder
    definition: {
      openapi: '3.0.0',
      info: {
        title: `${ APP_NAME } API`,
        version: '1.0',
      },
      components: {
        securitySchemes: {
          BearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
      security: [],
    },
  });
  return spec;
};


export default async function Page() {
  const spec = await getApiDocs();

  return (
    <section className="container">
      <ReactSwagger spec={spec} />
    </section>
  );
}
