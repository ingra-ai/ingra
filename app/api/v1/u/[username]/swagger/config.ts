/**
 * Swagger to use in the app and for creating OpenAI
 * @see https://platform.openai.com/docs/plugins/getting-started/openapi-definition
 * @see https://platform.openai.com/docs/plugins/examples To create your first plugin with OAuth
 */

import { APP_NAME, APP_PACKAGE_VERSION } from '@lib/constants';
import { createSwaggerSpec } from 'next-swagger-doc';

export type SwaggerOptions = NonNullable<Parameters<typeof createSwaggerSpec>[0]>;

export const getSwaggerSpec = async (username?: string) => {
  if ( !username ) {
    return null;
  }

  const swaggerOptions: SwaggerOptions = {
    apiFolder: `app/api/v1/user/${username}`, // define api folder under app folder
    apis: ['schemas/**/*.ts', 'lib/**/*.ts'],
    definition: {
      openapi: '3.0.0',
      info: {
        title: `${APP_NAME} Plugin API v1 for ${ username }`,
        version: APP_PACKAGE_VERSION,
        description: `Bakabit is a highly personalized virtual assistant, capable of managing an array of tasks for each individual user, including to-dos/tasks, calendars, sending emails, and expanding into more personalized utilities as needed.`,
      },
      // servers: {
      //   url: APP_URL,
      // },
      components: {
        // securitySchemes: {
        //   BearerAuth: {
        //     type: 'http',
        //     scheme: 'bearer',
        //     bearerFormat: 'JWT',
        //   },
        // },
      },
      security: [],
    },
  };

  const spec = createSwaggerSpec(swaggerOptions);
  return spec;
};
