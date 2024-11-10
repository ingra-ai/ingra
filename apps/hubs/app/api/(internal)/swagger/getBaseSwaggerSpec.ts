/**
 * Swagger to use in the app and for creating OpenAI
 * @see https://platform.openai.com/docs/plugins/getting-started/openapi-definition
 * @see https://platform.openai.com/docs/plugins/examples To create your first plugin with OAuth
 */
import { Logger } from '@repo/shared/lib/logger';

import baseSwaggerJson from '@/public/static/base-swagger.json';

export const getBaseSwaggerSpec = async () => {
  const spec = ( baseSwaggerJson || {} ) as Record<string, any>,
    specPathsLength = Object.keys(spec?.paths || {}).length;

  if ( specPathsLength === 0 ) {
    Logger.withTag('api|baseSwagger').warn('Base swagger spec is empty', { specPathsLength });
  }

  return spec;
};
