import { BASE_SWAGGER_SPEC_KEY, SwaggerOptions, getSwaggerSpec } from '@app/api/(internal)/swagger/config';
import { APP_OPENAI_MANIFEST_DESC_FOR_HUMAN } from '@repo/shared/lib/constants';
import { convertFunctionRecordToOpenApiSchema } from '@repo/shared/utils/functions/convertFunctionRecordToOpenApiSchema';
import { USERS_API_COLLECTION_FUNCTION_URI } from '@repo/shared/lib/constants';
import { getCollectionAccessibleByCommunity } from '@repo/shared/data/collections/getCollectionAccessibleByCommunity';
import { kv } from '@vercel/kv';
import isEmpty from 'lodash/isEmpty';

async function generateOpenApiSchema(ownerUsername: string, recordIdOrSlug: string) {
  if (!ownerUsername) {
    return null;
  }
  const collectionRecord = await getCollectionAccessibleByCommunity(ownerUsername, recordIdOrSlug, {
    findFirstArgs: {
      where: {
        functions: {
          some: {
            isPublished: true,
            isPrivate: false,
          },
        },
      },
      include: {
        owner: {
          include: {
            profile: {
              select: {
                userName: true,
              },
            },
          },
        },
        functions: {
          select: {
            id: false,
            code: false,
            isPrivate: false,
            ownerUserId: false,
            httpVerb: true,
            slug: true,
            description: true,
            arguments: true,
            tags: true,
          },
        },
      },
    },
  });

  if (!collectionRecord) {
    return {};
  }

  const collectionSlug = collectionRecord.slug;
  const collectionFunctions = collectionRecord.functions || [];

  if (!collectionSlug || collectionFunctions.length === 0) return {};

  return collectionFunctions.reduce((acc2, functionRecord) => {
    const functionSchema = convertFunctionRecordToOpenApiSchema(functionRecord as any, {
      transformHitUrl: (functionSlug) => USERS_API_COLLECTION_FUNCTION_URI.replace(':userName', ownerUsername).replace(':collectionSlug', collectionSlug).replace(':functionSlug', functionSlug),
    });
    return { ...acc2, ...functionSchema };
  }, {});
}

export const getCommunityCollectionSpec = async (ownerUsername: string, recordIdOrSlug: string) => {
  const [openApiPaths, baseSwaggerSpecCache, baseSwaggerSpec] = await Promise.all([generateOpenApiSchema(ownerUsername, recordIdOrSlug), kv.get<SwaggerOptions>(BASE_SWAGGER_SPEC_KEY), getSwaggerSpec(false)]);

  const mySwaggerSpec = {
    ...(baseSwaggerSpec || {}),
    ...(baseSwaggerSpecCache || {}),
  };

  if (isEmpty(mySwaggerSpec)) {
    return null;
  }

  /**
   * Update the title and description of the swagger
   */
  if (mySwaggerSpec?.info) {
    Object.assign(mySwaggerSpec.info, {
      title: `${ownerUsername}'s ${recordIdOrSlug} | Community Collection API`,
      description: APP_OPENAI_MANIFEST_DESC_FOR_HUMAN,
    });
  }

  if (mySwaggerSpec?.paths && openApiPaths) {
    // Remove built-in paths
    mySwaggerSpec.paths = {};
    Object.assign(mySwaggerSpec.paths, openApiPaths);
  }

  return mySwaggerSpec;
};
