
/**
 * Swagger to use in the app and for creating OpenAI
 * @see https://platform.openai.com/docs/plugins/getting-started/openapi-definition
 */

import { APP_NAME } from '@lib/constants';
import { createSwaggerSpec } from 'next-swagger-doc';

export type SwaggerOptions = NonNullable<Parameters<typeof createSwaggerSpec>[0]>;

export const swaggerOptions: SwaggerOptions = {
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
}

export const getSwaggerSpec = async () => {
  const spec = createSwaggerSpec(swaggerOptions);
  return spec;
};
