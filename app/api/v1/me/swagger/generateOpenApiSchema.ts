import { convertFunctionRecordToOpenApiSchema } from "@app/api/utils/functions/convertFunctionRecordToOpenApiSchema";
import { AuthSessionResponse } from "@app/auth/session/types";
import {
  USERS_API_FUNCTION_URI,
  USERS_API_COLLECTION_FUNCTION_URI

} from "@lib/constants";
import db from "@lib/db";

export async function generateOpenApiSchema(authSession: AuthSessionResponse) {
  if (!authSession || !authSession.user.id) {
    return null;
  }

  const [functionRecords, collectionRecords, subscribedFunctionRecords, subscribedCollectionRecords] = await Promise.all([
    // 1. Fetch all functions from user's own repository.
    db.function.findMany({
      where: {
        ownerUserId: authSession.user.id,
        isPublished: true
      },
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
      }
    }),

    // 2. Fetch all collections from user's own repository.
    db.collection.findMany({
      where: {
        userId: authSession.user.id
      },
      include: {
        owner: {
          select: {
            id: true,
            profile: {
              select: {
                userName: true,
              }
            }
          }
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
          }
        }
      }
    }),

    // 3. Fetch all user subscribed functions
    db.function.findMany({
      where: {
        subscribers: {
          some: {
            userId: authSession.user.id
          }
        },
        isPublished: true,
        isPrivate: false
      },
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
        owner: {
          select: {
            profile: {
              select: {
                userName: true,
              }
            }
          }
        }
      }
    }),

    // 4. Fetch all functions from collection subscriptions that user has subscribed to.
    db.collection.findMany({
      where: {
        subscribers: {
          some: {
            userId: authSession.user.id
          }
        },
      },
      include: {
        owner: {
          select: {
            id: true,
            profile: {
              select: {
                userName: true,
              }
            }
          }
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
            tags: true
          }
        }
      }
    }),
  ]);

  /**
   * User own functions and collections
   */
  const userFunctionsOpenApiSchema = functionRecords.reduce((acc, functionRecord) => {
    const functionSchema = convertFunctionRecordToOpenApiSchema(functionRecord as any, {
      transformHitUrl: (functionSlug) => 
        USERS_API_FUNCTION_URI
        .replace(':userName', authSession.user.profile?.userName || '')
        .replace(':functionSlug', functionSlug)
    });
    return { ...acc, ...functionSchema };
  }, {});

  const userCollectionsOpenApiSchema = collectionRecords.reduce((acc1, collection) => {
    const ownerUsername = collection.owner.profile?.userName || '';
    const collectionSlug = collection.slug;
    const collectionFunctions = collection.functions || [];

    if (!ownerUsername || !collectionSlug || collectionFunctions.length === 0) return {};

    return collectionFunctions.reduce((acc2, functionRecord) => {
      const functionSchema = convertFunctionRecordToOpenApiSchema(functionRecord as any, {
        transformHitUrl: (functionSlug) => 
          USERS_API_COLLECTION_FUNCTION_URI
            .replace(':userName', ownerUsername)
            .replace(':collectionSlug', collectionSlug)
            .replace(':functionSlug', functionSlug)
      });
      return { ...acc1, ...acc2, ...functionSchema };
    }, {});
  }, {});

  /**
   * User subscribed functions and collections
   */
  const userSubscribedFunctionsOpenApiSchema = subscribedFunctionRecords.reduce((acc, functionRecord) => {
    const functionOwnerUsername = functionRecord.owner.profile?.userName || '';

    if ( !functionOwnerUsername ) {
      return {};
    }

    const functionSchema = convertFunctionRecordToOpenApiSchema(functionRecord as any, {
      transformHitUrl: (functionSlug) => 
        USERS_API_FUNCTION_URI
          .replace(':userName', functionOwnerUsername)
          .replace(':functionSlug', functionSlug)
    });
    return { ...acc, ...functionSchema };
  }, {});

  const userSubscribedCollectionssOpenApiSchema = subscribedCollectionRecords.reduce((acc1, collection) => {
    const ownerUsername = collection.owner.profile?.userName || '';
    const collectionSlug = collection.slug;
    const collectionFunctions = collection.functions || [];

    if (!ownerUsername || collectionFunctions.length === 0) return {};

    return collectionFunctions.reduce((acc2, functionRecord) => {

      const functionSchema = convertFunctionRecordToOpenApiSchema(functionRecord as any, {
        transformHitUrl: (functionSlug) => 
          USERS_API_COLLECTION_FUNCTION_URI
            .replace(':userName', ownerUsername)
            .replace(':collectionSlug', collectionSlug)
            .replace(':functionSlug', functionSlug)
      });
      return { ...acc1, ...acc2, ...functionSchema };
    }, {});
  }, {});

  return {
    ...userFunctionsOpenApiSchema,
    ...userCollectionsOpenApiSchema,
    ...userSubscribedFunctionsOpenApiSchema,
    ...userSubscribedCollectionssOpenApiSchema
  };
}
