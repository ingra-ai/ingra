/**
 * Swagger to use in the app and for creating OpenAI
 * @see https://platform.openai.com/docs/plugins/getting-started/openapi-definition
 * @see https://platform.openai.com/docs/plugins/examples To create your first plugin with OAuth
 */

import { APP_NAME, APP_OPENAI_MANIFEST_DESC_FOR_HUMAN, APP_PACKAGE_VERSION } from '@lib/constants';
import { createSwaggerSpec } from 'next-swagger-doc';

export type SwaggerOptions = NonNullable<Parameters<typeof createSwaggerSpec>[0]>;

export type SwaggerExtraProps = {
  title: string;
  description: string;
  extraPaths: SwaggerOptions['definition']['paths'];
};

export const getSwaggerSpec = async ( extraProps?: SwaggerExtraProps ) => {
  const swaggerOptions: SwaggerOptions = {
    apiFolder: 'app/api', // define api folder under app folder
    apis: ['schemas/**/*.ts', 'lib/**/*.ts', 'app/**/*.ts'],
    definition: {
      openapi: '3.0.0',
      info: {
        title: extraProps?.title || `${APP_NAME} Plugin API`,
        version: APP_PACKAGE_VERSION,
        description: extraProps?.description || APP_OPENAI_MANIFEST_DESC_FOR_HUMAN,
      },
      paths: {
        ...( extraProps?.extraPaths || {} ),
      },
      components: {
      },
      security: [],
    },
  };

  const spec = createSwaggerSpec(swaggerOptions);
  return spec;
};
