/**
 * Swagger to use in the app and for creating OpenAI
 * @see https://platform.openai.com/docs/plugins/getting-started/openapi-definition
 * @see https://platform.openai.com/docs/plugins/examples To create your first plugin with OAuth
 */

import { APP_NAME, APP_OPENAI_MANIFEST_DESC_FOR_HUMAN, APP_PACKAGE_VERSION } from '@lib/constants';
import { createSwaggerSpec } from 'next-swagger-doc';

export type SwaggerOptions = NonNullable<Parameters<typeof createSwaggerSpec>[0]>;

type GetSwaggerSpecProps = {
  title?: string;
  description?: string;
  definition?: {
    paths: SwaggerOptions['definition']['paths'];
    components: SwaggerOptions['definition']['components'];
  };
};

export const getSwaggerSpec = ( extraOptions: GetSwaggerSpecProps ) => {
  const swaggerOptions: SwaggerOptions = {
    apiFolder: 'app/api/v1', // define api folder under app folder
    apis: [
      'app/api/v1/**/*.ts'
    ],
    definition: {
      openapi: '3.0.0',
      info: {
        title: extraOptions?.title || `${APP_NAME} Plugin API`,
        version: APP_PACKAGE_VERSION,
        description: extraOptions?.description || APP_OPENAI_MANIFEST_DESC_FOR_HUMAN,
      },
      paths: {
        ...( extraOptions?.definition?.paths || {} ),
      },
      components: {
        ...( extraOptions?.definition?.components || {} ),
      },
      security: [],
    },
  };

  const spec = createSwaggerSpec(swaggerOptions);
  return spec;
};
