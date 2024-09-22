import db from '@repo/db/client';
import { Prisma } from '@repo/db/prisma';
import { isUuid } from '../../lib/utils';

type GetFunctionAccessibleByUserDefaultArgsType = Pick<Prisma.FunctionFindFirstArgs, 'include' | 'select'> & {
  where?: Prisma.FunctionFindFirstArgs['where'];
};

type GetFunctionAccessibleByUserOptionsType<T extends GetFunctionAccessibleByUserDefaultArgsType> = {
  findFirstArgs?: T;
};

/**
 * Get the function record accessible by the user.
 * Whether the user is the owner, subscriber, or the function is part of a collection that the user is subscribed to.
 * @param {string} ownerUsername - The invoker user ID
 * @param {string} recordIdOrSlug - The function ID or slug
 * @param {GetFunctionAccessibleByUserOptionsType<T>} options - Optional. Specifies the access types and findFirstArgs.
 * @returns {Promise<Prisma.FunctionGetPayload<T> | null>} - Returns the function record accessible by the user. If not found, returns null.
 */
export const getFunctionAccessibleByCommunity = async <T extends GetFunctionAccessibleByUserDefaultArgsType>(
  ownerUsername: string,
  recordIdOrSlug: string,
  options?: GetFunctionAccessibleByUserOptionsType<T>
): Promise<Prisma.FunctionGetPayload<T> | null> => {
  if (!recordIdOrSlug || !ownerUsername) {
    return null;
  }

  const useUuid = isUuid(recordIdOrSlug),
    defaultOptions: GetFunctionAccessibleByUserOptionsType<GetFunctionAccessibleByUserDefaultArgsType> = {
      findFirstArgs: {
        where: {},
        include: {
          arguments: true,
          tags: true,
        },
      },
    },
    findFirstArgs = options?.findFirstArgs || defaultOptions.findFirstArgs;

  if (!findFirstArgs) {
    return null;
  }

  // Define the query conditions based on the accessType
  const OrWhereConditions: Prisma.FunctionWhereInput[] = [
    {
      isPublished: true,
      isPrivate: false,
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

  // Append where conditions from the ones that is supplied in options
  if (findFirstArgs.where) {
    OrWhereConditions.push(findFirstArgs.where);
  }

  // Find the function
  const functionRecord = (await db.function.findFirst({
    where: {
      OR: OrWhereConditions,
    },
    ...(findFirstArgs.include ? { include: findFirstArgs.include } : {}),
    ...(findFirstArgs.select ? { select: findFirstArgs.select } : {}),
  })) as Prisma.FunctionGetPayload<T> | null;

  return functionRecord;
};
