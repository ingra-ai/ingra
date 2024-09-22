import db from '@repo/db/client';
import { Prisma } from '@repo/db/prisma';
import { isUuid } from '../../lib/utils';

export type CollectionAccessType =
  // User is the owner of the collection
  | 'owner'

  // Other user's collection where user is a subscriber and the collection is not private
  | 'subscriber'

type GetCollectionAccessibleByUserDefaultArgsType = Pick<Prisma.CollectionFindFirstArgs, 'include' | 'select'> & {
  where?: Prisma.CollectionFindFirstArgs['where'];
};

type GetCollectionAccessibleByUserOptionsType<T extends GetCollectionAccessibleByUserDefaultArgsType> = {
  accessTypes?: CollectionAccessType[];
  findFirstArgs?: T;
};

/**
 * Get the collection record accessible by the user.
 * Whether the user is the owner, subscriber, or the collection is part of a collection that the user is subscribed to.
 * @param {string} userId - The invoker user ID
 * @param {string} recordIdOrSlug - The collection ID or slug
 * @param {GetCollectionAccessibleByUserOptionsType<T>} options - Optional. Specifies the access types and findFirstArgs.
 * @returns {Promise<Prisma.CollectionGetPayload<T> | null>} - Returns the collection record accessible by the user. If not found, returns null.
 */
export const getCollectionAccessibleByUser = async <T extends GetCollectionAccessibleByUserDefaultArgsType>(
  userId: string,
  recordIdOrSlug: string,
  options?: GetCollectionAccessibleByUserOptionsType<T>
): Promise<Prisma.CollectionGetPayload<T> | null> => {
  const useUuid = isUuid(recordIdOrSlug),
    defaultOptions: GetCollectionAccessibleByUserOptionsType<GetCollectionAccessibleByUserDefaultArgsType> = {
      accessTypes: ['owner', 'subscriber'],
      findFirstArgs: {
        where: {},
        include: {
          functions: {
            include: {
              arguments: true,
              tags: true,
            }
          },
        },
      },
    },
    accessTypes = Array.isArray(options?.accessTypes) ? options.accessTypes : defaultOptions.accessTypes,
    findFirstArgs = options?.findFirstArgs || defaultOptions.findFirstArgs;

  if (!accessTypes?.length || !findFirstArgs) {
    return null;
  }

  // Define the query conditions based on the accessType
  const whereConditions: Prisma.CollectionWhereInput[] = [];

  if (accessTypes.indexOf('owner') >= 0) {
    /**
     * Case 1 - User is the owner
     */
    whereConditions.push(
      useUuid
        ? {
            id: recordIdOrSlug,
            userId,
          }
        : {
            slug: recordIdOrSlug,
            userId,
          }
    );
  }

  if (accessTypes.indexOf('subscriber') >= 0) {
    /**
     * Case 2 - User is a subscriber and its other user's function
     */
    whereConditions.push({
      AND: [
        {
          subscribers: {
            some: {
              userId: userId,
            },
          },
        },
        useUuid
          ? {
              id: recordIdOrSlug,
            }
          : {
              slug: recordIdOrSlug,
            }
      ],
    });
  }

  // Append where conditions from the ones that is supplied in options
  if (findFirstArgs.where) {
    whereConditions.push(findFirstArgs.where);
  }

  // Find the function
  const collectionRecord = (await db.collection.findFirst({
    where: {
      OR: whereConditions,
    },
    ...(findFirstArgs.include ? { include: findFirstArgs.include } : {}),
    ...(findFirstArgs.select ? { select: findFirstArgs.select } : {}),
  })) as Prisma.CollectionGetPayload<T> | null;

  return collectionRecord;
};
