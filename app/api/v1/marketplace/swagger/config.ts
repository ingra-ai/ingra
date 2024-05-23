import { getSwaggerSpec } from '@app/api/(internal)/swagger/config';
import { APP_NAME, APP_OPENAI_MANIFEST_DESC_FOR_HUMAN } from '@lib/constants';
// import { generateMarketplaceOpenApiSchema } from './generateMarketplaceOpenApiSchema';

export const getMarketplaceSwaggerSpec = async () => {
  // Disable for now
  // const allMarketplaceFunctionsPaths = await generateMarketplaceOpenApiSchema();

  return getSwaggerSpec({
    title: `Marketplace | ${APP_NAME} Plugin API`,
    description: APP_OPENAI_MANIFEST_DESC_FOR_HUMAN
  });
};
