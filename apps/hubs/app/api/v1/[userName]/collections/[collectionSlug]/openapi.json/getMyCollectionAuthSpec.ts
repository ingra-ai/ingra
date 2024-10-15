import { AuthSessionResponse } from '@repo/shared/data/auth/session/types';
import { getCollectionAccessibleByUser } from '@repo/shared/data/collections';
import { APP_OPENAI_MANIFEST_DESC_FOR_HUMAN , USERS_API_COLLECTION_FUNCTION_URI } from '@repo/shared/lib/constants';
import { convertFunctionRecordToOpenApiSchema } from '@repo/shared/utils/functions/convertFunctionRecordToOpenApiSchema';
import { kv } from '@vercel/kv';
import isEmpty from 'lodash/isEmpty';

import { BASE_SWAGGER_SPEC_KEY, SwaggerOptions, getSwaggerSpec } from '@app/api/(internal)/swagger/config';

async function generateOpenApiSchema(authSession: AuthSessionResponse, recordIdOrSlug: string) {
  if (!authSession || !authSession.user.id) {
    return null;
  }
  const collectionRecord = await getCollectionAccessibleByUser(authSession.user.id, recordIdOrSlug, {
    accessTypes: ['owner'],
    findFirstArgs: {
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

  const ownerUsername = collectionRecord.owner?.profile?.userName || '';
  const collectionSlug = collectionRecord.slug;
  const collectionFunctions = collectionRecord.functions || [];

  if (!ownerUsername || !collectionSlug || collectionFunctions.length === 0) return {};

  return collectionFunctions.reduce((acc2, functionRecord) => {
    const functionSchema = convertFunctionRecordToOpenApiSchema(functionRecord as any, {
      transformHitUrl: (functionSlug) => USERS_API_COLLECTION_FUNCTION_URI.replace(':userName', ownerUsername).replace(':collectionSlug', collectionSlug).replace(':functionSlug', functionSlug),
    });
    return { ...acc2, ...functionSchema };
  }, {});
}

export const getMyCollectionAuthSpec = async (authSession: AuthSessionResponse, ownerUsername: string, recordIdOrSlug: string) => {
  if ( !authSession || authSession.user.profile?.userName !== ownerUsername ) {
    return null;
  }

  const [openApiPaths, baseSwaggerSpecCache, baseSwaggerSpec] = await Promise.all([generateOpenApiSchema(authSession, recordIdOrSlug), kv.get<SwaggerOptions>(BASE_SWAGGER_SPEC_KEY), getSwaggerSpec(false)]);

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
      title: `${recordIdOrSlug} | My Collection API`,
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
