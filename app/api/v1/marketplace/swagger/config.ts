import { getSwaggerSpec } from '@app/api/(internal)/swagger/config';
import { APP_NAME, APP_OPENAI_MANIFEST_DESC_FOR_HUMAN } from '@lib/constants';
import * as stuff from '@app/api/v1/types/api-response';
// import { generateMarketplaceOpenApiSchema } from '@v1/marketplace/functions/generateMarketplaceOpenApiSchema';

export const getMarketplaceSwaggerSpec = async () => {
  // Disable for now
  // const allMarketplaceFunctionsPaths = await generateMarketplaceOpenApiSchema();
  const allMarketplaceFunctionsPaths = await new Promise((resolve) => {
    setTimeout(() => {
      resolve({});
    }, 2000);
  });

  return getSwaggerSpec({
    title: `Marketplace | ${APP_NAME} Plugin API`,
    description: APP_OPENAI_MANIFEST_DESC_FOR_HUMAN,
    extraPaths: {
      ...( allMarketplaceFunctionsPaths || {} )
    },
  });
};
