import type { FetchCommunityCollectionListPaginationType } from '@repo/components/data/collections/community/types';
import clamp from 'lodash/clamp';
import db from '@repo/db/client';

export const fetchPaginationData = async (searchParams: Record<string, string | string[] | undefined> = {}, userId: string) => {
  // Parse the query parameteres
  let { page = '1' } = searchParams;
  page = Array.isArray(page) ? page[0] : page;

  // Validate and sanitize page and pageSize
  const pageInt = Number.isInteger(Number(page)) && Number(page) > 0 ? parseInt(page, 10) : 1;
  const pageSizeInt = 20;

  // Calculate skip value based on page and pageSize
  const skip = clamp(pageInt - 1, 0, 1e3) * pageSizeInt;

  const [totalCount, allCollections] = await Promise.all([
    // Fetch the total count of collections
    db.collection.count({
      where: {
        NOT: {
          userId,
        },
        functions: {
          some: {
            isPublished: true,
            isPrivate: false,
          },
        },
      },
    }),

    // Fetch paginated collections
    db.collection.findMany({
      where: {
        NOT: {
          userId,
        },
        functions: {
          some: {
            isPublished: true,
            isPrivate: false,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        owner: {
          select: {
            profile: {
              select: {
                userName: true,
              },
            },
          },
        },
        functions: {
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
          },
        },
        _count: {
          select: {
            subscribers: true,
          },
        },
        subscribers: {
          where: {
            userId,
          },
          select: {
            id: true,
          },
        },
      },
      skip,
      take: pageSizeInt,
    }),
  ]);

  // Transform the `subscribers` field into a boolean `isSubscribed`
  const collectionsWithSubscriptionStatus = allCollections.map((collection) => ({
    ...collection,
    isSubscribed: Array.isArray(collection?.subscribers) && collection.subscribers.length > 0,
  }));

  // Calculate pagination details
  const totalRecords = totalCount;
  const nbPages = Math.ceil(totalRecords / pageSizeInt);
  const hasNext = skip + pageSizeInt < totalRecords;
  const hasPrevious = pageInt > 1;

  const result: FetchCommunityCollectionListPaginationType = {
    records: collectionsWithSubscriptionStatus,
    page: pageInt,
    pageSize: pageSizeInt,
    totalRecords,
    nbPages,
    hasNext,
    hasPrevious,
  };

  return result;
};
