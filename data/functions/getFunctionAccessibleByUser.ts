import db from "@lib/db";
import { isUuid } from "@lib/utils";
import { Prisma } from "@prisma/client";

export type FunctionAccessType = 
  // User is the owner of the function
  'owner' | 

  // Other user's function where user is a subscriber and the function is not private
  'subscriber' | 

  // Function is part of a collection that user is subscribed to
  'subscribedCollection';

type GetFunctionAccessibleByUserDefaultArgsType = Pick<Prisma.FunctionFindFirstArgs, 'include' | 'select'> & {
  where?: Prisma.FunctionFindFirstArgs['where']
};

type GetFunctionAccessibleByUserOptionsType<T extends GetFunctionAccessibleByUserDefaultArgsType> = {
  accessTypes?: FunctionAccessType[],
  findFirstArgs?: T
};

/**
 * Get the function record accessible by the user.
 * Whether the user is the owner, subscriber, or the function is part of a collection that the user is subscribed to.
 * @param {string} functionIdOrSlug - The function ID or slug
 * @param {string} userId - The invoker user ID
 * @param {GetFunctionAccessibleByUserOptionsType<T>} options - Optional. Specifies the access types and findFirstArgs.
 * @returns {Promise<Prisma.FunctionGetPayload<T> | null>} - Returns the function record accessible by the user. If not found, returns null. 
 */
export const getFunctionAccessibleByUser = async <T extends GetFunctionAccessibleByUserDefaultArgsType>(
  userId: string,
  functionIdOrSlug: string,
  options?: GetFunctionAccessibleByUserOptionsType<T>
): Promise<Prisma.FunctionGetPayload<T> | null> => {
  const useUuid = isUuid(functionIdOrSlug),
    defaultOptions: GetFunctionAccessibleByUserOptionsType<GetFunctionAccessibleByUserDefaultArgsType> = {
      accessTypes: ['owner', 'subscriber', 'subscribedCollection'],
      findFirstArgs: {
        where: {},
        include: {
          arguments: true,
          tags: true,
        },
      }
    },
    accessTypes = Array.isArray(options?.accessTypes) ? options.accessTypes : defaultOptions.accessTypes,
    findFirstArgs = options?.findFirstArgs || defaultOptions.findFirstArgs;

  if (!accessTypes?.length || !findFirstArgs) {
    return null;
  }

  // Define the query conditions based on the accessType
  const whereConditions: Prisma.FunctionWhereInput[] = [];

  if (accessTypes.indexOf('owner') >= 0) {
    /**
     * Case 1 - User is the owner
     */
    whereConditions.push(
      useUuid ? {
        id: functionIdOrSlug,
        ownerUserId: userId
      } : {
        slug: functionIdOrSlug,
        ownerUserId: userId
      }
    );
  }

  if (accessTypes.indexOf('subscriber') >= 0) {
    /**
     * Case 2 - User is a subscriber and its other user's function
     */
    whereConditions.push(
      {
        AND: [
          {
            subscribers: {
              some: {
                userId: userId
              }
            }
          },
          useUuid ? {
            id: functionIdOrSlug
          } : {
            slug: functionIdOrSlug
          },
          {
            isPublished: true,
            isPrivate: false
          }
        ]
      }
    );
  }

  if (accessTypes.indexOf('subscribedCollection') >= 0) {
    /**
     * Case 3 - Function is part of a collection that user is subscribed to.
     */
    whereConditions.push(
      {
        AND: [
          {
            collectors: {
              some: {
                subscribers: {
                  some: {
                    userId: userId
                  }
                }
              }
            }
          },
          useUuid ? {
            id: functionIdOrSlug
          } : {
            slug: functionIdOrSlug
          },
          {
            isPublished: true,
            isPrivate: false
          }
        ]
      }
    );
  }

  // Append where conditions from the ones that is supplied in options
  if (findFirstArgs.where) {
    whereConditions.push(findFirstArgs.where);
  }

  // Find the function
  const functionRecord = await db.function.findFirst({
    where: {
      OR: whereConditions,
    },
    ...( findFirstArgs.include ? { include: findFirstArgs.include } : {} ),
    ...( findFirstArgs.select ? { select: findFirstArgs.select } : {} ),
  }) as Prisma.FunctionGetPayload<T> | null;

  return functionRecord;
};
