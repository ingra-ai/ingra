/**
 * Swagger to use in the app and for creating OpenAI
 * @see https://platform.openai.com/docs/plugins/getting-started/openapi-definition
 * @see https://platform.openai.com/docs/plugins/examples To create your first plugin with OAuth
 */

import { generateMarketplaceOpenApiSchema } from '@v1/marketplace/[[...paths]]/handlers/generateMarketplaceOpenApiSchema';
import { APP_NAME, APP_OPENAI_MANIFEST_DESC_FOR_HUMAN, APP_PACKAGE_VERSION } from '@lib/constants';
import { createSwaggerSpec } from 'next-swagger-doc';

export type SwaggerOptions = NonNullable<Parameters<typeof createSwaggerSpec>[0]>;

export const getSwaggerSpec = async () => {
  const allMarketplaceFunctionsPaths = await generateMarketplaceOpenApiSchema();

  const swaggerOptions: SwaggerOptions = {
    apiFolder: 'app/api/v1', // define api folder under app folder
    apis: ['schemas/**/*.ts', 'lib/**/*.ts', 'app/**/*.ts'],
    definition: {
      openapi: '3.0.0',
      info: {
        title: `${APP_NAME} Plugin API`,
        version: APP_PACKAGE_VERSION,
        description: [
          APP_OPENAI_MANIFEST_DESC_FOR_HUMAN,
          'Only 30 functions that is forked the most will be displayed here.'
        ].join('\n'),
      },
      paths: {
        ...allMarketplaceFunctionsPaths,
      },
      components: {
      },
      security: [],
    },
  };

  const spec = createSwaggerSpec(swaggerOptions);
  return spec;
};
