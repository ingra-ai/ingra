/**
 * Swagger to use in the app and for creating OpenAI
 * @see https://platform.openai.com/docs/plugins/getting-started/openapi-definition
 * @see https://platform.openai.com/docs/plugins/examples To create your first plugin with OAuth
 */

import { Logger } from '@repo/shared/lib/logger';
import { kv } from '@vercel/kv';
import { createSwaggerSpec } from 'next-swagger-doc';
import baseSwaggerJson from '@/public/static/base-swagger.json';

export type SwaggerOptions = NonNullable<Parameters<typeof createSwaggerSpec>[0]>;

/**
 * A bit of background story for this key.
 * For some reason, swagger jsdoc fails to generate the annotations from files when accessed on /api/v1/me/swagger.
 * The issue only happens when deployed on vercel, but works fine on local.
 * Therefore, for the approach to work, we need to store the base swagger annotations in KV store, to keep the code cleaner.
 * @todo Remove this key when the issue is resolved.
 */
export const BASE_SWAGGER_SPEC_KEY = 'BASE_SWAGGER_SPEC';

export const getBaseSwaggerSpec = async (storeToCache = false) => {
  const spec = ( baseSwaggerJson || {} ) as Record<string, any>,
    specPathsLength = Object.keys(spec?.paths || {}).length;

  if (storeToCache && specPathsLength > 0) {
    await Promise.all([kv.set(BASE_SWAGGER_SPEC_KEY, spec), Logger.withTag('api|baseSwagger').log('Stored base swagger spec to KV store', { specPathsLength })]);
  }

  return spec;
};
