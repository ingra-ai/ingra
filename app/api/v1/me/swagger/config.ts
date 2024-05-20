/**
 * Swagger to use in the app and for creating OpenAI
 * @see https://platform.openai.com/docs/plugins/getting-started/openapi-definition
 * @see https://platform.openai.com/docs/plugins/examples To create your first plugin with OAuth
 */

import { generateOpenApiSchema } from '@app/api/utils/functions/generateOpenApiSchema';
import { AuthSessionResponse } from '@app/auth/session';
import { APP_NAME, APP_PACKAGE_VERSION } from '@lib/constants';
import { createSwaggerSpec } from 'next-swagger-doc';

export type SwaggerOptions = NonNullable<Parameters<typeof createSwaggerSpec>[0]>;

export const getAuthSwaggerSpec = async (authSession: AuthSessionResponse) => {
  if ( !authSession ) {
    return null;
  }

  const username = authSession?.user?.profile?.userName || authSession.user.email;

  const userFunctionsPaths = await generateOpenApiSchema(authSession);

  const swaggerOptions: SwaggerOptions = {
    apiFolder: `app/api`, // define api folder under app folder
    apis: ['app/api/v1/**/*.ts'],
    definition: {
      openapi: '3.0.0',
      info: {
        title: `${ username } | ${APP_NAME} Plugin API v1`,
        version: APP_PACKAGE_VERSION,
        description: `Bakabit is a highly personalized virtual assistant, capable of managing an array of curated functions and workflows for each individual user, and expanding into more personalized utilities as needed.`,
      },
      paths: {
        ...userFunctionsPaths,
      },
      components: {
      },
      security: [],
    },
  };

  const spec = createSwaggerSpec(swaggerOptions);
  return spec;
};
