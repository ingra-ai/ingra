/**
 * Swagger to use in the app and for creating OpenAI
 * @see https://platform.openai.com/docs/plugins/getting-started/openapi-definition
 * @see https://platform.openai.com/docs/plugins/examples To create your first plugin with OAuth
 */

import { APP_NAME, APP_OPENAI_MANIFEST_DESC_FOR_HUMAN, APP_PACKAGE_VERSION } from '@repo/shared/lib/constants';
import { Logger } from '@repo/shared/lib/logger';
import { kv } from '@vercel/kv';
import { createSwaggerSpec } from 'next-swagger-doc';

export type SwaggerOptions = NonNullable<Parameters<typeof createSwaggerSpec>[0]>;

/**
 * A bit of background story for this key.
 * For some reason, swagger jsdoc fails to generate the annotations from files when accessed on /api/v1/me/swagger.
 * The issue only happens when deployed on vercel, but works fine on local.
 * Therefore, for the approach to work, we need to store the base swagger annotations in KV store, to keep the code cleaner.
 * @todo Remove this key when the issue is resolved.
 */
export const BASE_SWAGGER_SPEC_KEY = 'BASE_SWAGGER_SPEC';

export const getSwaggerSpec = async (storeToCache = false) => {
  const swaggerOptions: SwaggerOptions = {
    apiFolder: 'api', // define api folder under app folder
    apis: ['app/api/**/*.ts', 'schemas/**/*.ts'],
    definition: {
      openapi: '3.1.0',
      info: {
        title: `${APP_NAME} Plugin API`,
        version: APP_PACKAGE_VERSION,
        description: APP_OPENAI_MANIFEST_DESC_FOR_HUMAN,
      },
      paths: {},
      components: {},
      security: [],
    },
  };

  const spec = createSwaggerSpec(swaggerOptions),
    specLength = Object.keys(spec || {}).length;

  if (storeToCache) {
    await Promise.all([kv.set(BASE_SWAGGER_SPEC_KEY, spec), Logger.withTag('api|swagger').log('Stored base swagger spec to KV store', { specLength })]);
  }

  return spec;
};
