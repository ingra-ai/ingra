
/**
 * Swagger to use in the app and for creating OpenAI
 * @see https://platform.openai.com/docs/plugins/getting-started/openapi-definition
 * @see https://platform.openai.com/docs/plugins/examples To create your first plugin with OAuth
 */

import { APP_NAME, APP_PACKAGE_VERSION, APP_URL } from '@lib/constants';
import { createSwaggerSpec } from 'next-swagger-doc';

export type SwaggerOptions = NonNullable<Parameters<typeof createSwaggerSpec>[0]>;

export const swaggerOptions: SwaggerOptions = {
  apiFolder: 'app/api', // define api folder under app folder
  definition: {
    openapi: '3.0.0',
    info: {
      title: `${ APP_NAME } Plugin API`,
      version: APP_PACKAGE_VERSION,
      description: `A plugin that allows the user to create and manage a TODO list using ChatGPT. If you do not know the user's username, ask them first before making queries to the plugin. Otherwise, use the username "global"`
    },
    // servers: {
    //   url: APP_URL,
    // },
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
