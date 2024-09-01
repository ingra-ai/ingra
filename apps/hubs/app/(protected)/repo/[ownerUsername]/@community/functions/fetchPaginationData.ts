import type { FetchCommunityFunctionListPaginationType } from '@repo/components/data/functions/community/types';
import clamp from 'lodash/clamp';
import db from '@repo/db/client';

export const fetchPaginationData = async (searchParams: Record<string, string | string[] | undefined> = {}, ownerUserId: string, callerUserId?: string) => {
  // Parse the query parameteres
  let { page = '1' } = searchParams;
  page = Array.isArray(page) ? page[0] : page;

  // Validate and sanitize page and pageSize
  const pageInt = Number.isInteger(Number(page)) && Number(page) > 0 ? parseInt(page, 10) : 1;
  const pageSizeInt = 20;

  // Calculate skip value based on page and pageSize
  const skip = clamp(pageInt - 1, 0, 1e3) * pageSizeInt;

  const [totalCount, allFunctions] = await Promise.all([
    // Fetch the total count of functions
    db.function.count({
      where: {
        ownerUserId,
        isPublished: true,
        isPrivate: false,
      },
    }),

    // Fetch paginated functions
    db.function.findMany({
      where: {
        ownerUserId,
        isPublished: true,
        isPrivate: false,
      },
      orderBy: {
        updatedAt: 'desc',
      },
      select: {
        id: true,
        slug: true,
        code: false,
        description: true,
        httpVerb: true,
        isPrivate: true,
        isPublished: true,
        ownerUserId: true,
        createdAt: false,
        updatedAt: true,
        owner: {
          select: {
            id: true,
            profile: {
              select: {
                userName: true,
              },
            },
          },
        },
        tags: {
          select: {
            id: true,
            name: true,
            functionId: false,
            function: false,
          },
        },
        arguments: {
          select: {
            id: true,
            name: true,
            description: false,
            type: true,
            defaultValue: false,
            isRequired: false,
          },
        },
        ...(callerUserId !== ownerUserId
          ? {
              subscribers: {
                where: {
                  userId: callerUserId,
                },
                select: {
                  id: true,
                },
              },
            }
          : {}),
      },
      skip,
      take: pageSizeInt,
    }),
  ]);

  // Transform the `subscribers` field into a boolean `isSubscribed`
  const functionsWithSubscriptionStatus = allFunctions.map((functionRecord) => ({
    ...functionRecord,
    isSubscribed: Array.isArray(functionRecord?.subscribers) && functionRecord.subscribers.length > 0,
  }));

  // Calculate pagination details
  const totalRecords = totalCount;
  const nbPages = Math.ceil(totalRecords / pageSizeInt);
  const hasNext = skip + pageSizeInt < totalRecords;
  const hasPrevious = pageInt > 1;

  const result: FetchCommunityFunctionListPaginationType = {
    records: functionsWithSubscriptionStatus,
    page: pageInt,
    pageSize: pageSizeInt,
    totalRecords,
    nbPages,
    hasNext,
    hasPrevious,
  };

  return result;
};
