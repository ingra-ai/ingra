import db from '@repo/db/client';
import { Prisma } from '@repo/db/prisma';
import { isUuid } from '../../lib/utils';

type GetCollectionAccessibleByUserDefaultArgsType = Pick<Prisma.CollectionFindFirstArgs, 'include' | 'select'> & {
  where?: Prisma.CollectionFindFirstArgs['where'];
};

type GetCollectionAccessibleByUserOptionsType<T extends GetCollectionAccessibleByUserDefaultArgsType> = {
  findFirstArgs?: T;
};

/**
 * Get the collection record accessible by the user.
 * Whether the user is the owner, subscriber, or the collection is part of a collection that the user is subscribed to.
 * @param {string} ownerUsername - The invoker user ID
 * @param {string} recordIdOrSlug - The collection ID or slug
 * @param {GetCollectionAccessibleByUserOptionsType<T>} options - Optional. Specifies the access types and findFirstArgs.
 * @returns {Promise<Prisma.CollectionGetPayload<T> | null>} - Returns the collection record accessible by the user. If not found, returns null.
 */
export const getCollectionAccessibleByCommunity = async <T extends GetCollectionAccessibleByUserDefaultArgsType>(
  ownerUsername: string,
  recordIdOrSlug: string,
  options?: GetCollectionAccessibleByUserOptionsType<T>
): Promise<Prisma.CollectionGetPayload<T> | null> => {
  if (!recordIdOrSlug || !ownerUsername) {
    return null;
  }

  const useUuid = isUuid(recordIdOrSlug),
    defaultOptions: GetCollectionAccessibleByUserOptionsType<GetCollectionAccessibleByUserDefaultArgsType> = {
      findFirstArgs: {
        where: {},
        include: {
          functions: {
            include: {
              arguments: true,
              tags: true,
            },
          },
        },
      },
    },
    findFirstArgs = options?.findFirstArgs || defaultOptions.findFirstArgs;

  if (!findFirstArgs) {
    return null;
  }

  // Define the query conditions based on the accessType
  const OrWhereConditions: Prisma.CollectionWhereInput[] = [
    {
      owner: {
        profile: {
          userName: ownerUsername,
        },
      },
      ...(useUuid
        ? {
            id: recordIdOrSlug,
          }
        : {
            slug: recordIdOrSlug,
          }),
    },
  ];

  // Find the function
  const collectionRecord = (await db.collection.findFirst({
    where: {
      OR: OrWhereConditions,
    },
    ...(findFirstArgs.include ? { include: findFirstArgs.include } : {}),
    ...(findFirstArgs.select ? { select: findFirstArgs.select } : {}),
  })) as Prisma.CollectionGetPayload<T> | null;

  return collectionRecord;
};
