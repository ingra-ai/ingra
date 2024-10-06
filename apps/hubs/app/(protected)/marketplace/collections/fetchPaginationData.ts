import type { FetchCollectionSearchListPaginationType } from '@repo/components/data/collections/types';
import clamp from 'lodash/clamp';
import db from '@repo/db/client';
import { Prisma } from '@repo/db/prisma';

export const fetchPaginationData = async (searchParams: Record<string, string | string[] | undefined> = {}, invokerUserId?: string, ownerUserId?: string) => {
  // Define available sort keys and orders
  const availableSortKeys = ['name', 'updatedAt', 'subscribers'],
    availableSortOrders = ['asc', 'desc'];

  // Parse the query parameteres
  let { 
    q = '',
    page = '1',
    pageSize = '20',
    sortBy = 'updatedAt_desc',
  } = searchParams;
  q = Array.isArray(q) ? q[0] : q;
  page = Array.isArray(page) ? page[0] : page;
  pageSize = Array.isArray(pageSize) ? pageSize[0] : pageSize;
  sortBy = Array.isArray(sortBy) ? sortBy[0] : sortBy;

  // Validate and sanitize page and pageSize
  const pageInt = Number.isInteger(Number(page)) && Number(page) > 0 ? parseInt(page, 10) : 1;
  const pageSizeInt = clamp(Number.isInteger(Number(pageSize)) ? parseInt(pageSize, 10) : 20, 1, 40);

  // Calculate skip value based on page and pageSize
  const skip = clamp(pageInt - 1, 0, 1e3) * pageSizeInt;

  // Calculate orderBy based on sortBy
  let [sortKey, sortOrder] = sortBy.split('_');
  if (!availableSortKeys.includes(sortKey) || !availableSortOrders.includes(sortOrder)) {
    // Revert to default values if the sortBy query parameter is invalid
    sortBy = 'updatedAt_desc';
    sortKey = 'updatedAt';
    sortOrder = 'desc';
  }

  // Define whereQuery based on the query parameteres 'q' and argument 'ownerUserId'
  const whereQuery: Prisma.CollectionWhereInput = {
    functions: {
      some: {
        isPublished: true,
        isPrivate: false,
      },
    },
  };

  // Apply search query
  if ( ownerUserId ) {
    whereQuery.userId = ownerUserId;
  }

  if ( q ) {
    whereQuery.OR = [
      {
        name: {
          contains: q,
          mode: 'insensitive',
        },
      },
      {
        slug: {
          contains: q,
          mode: 'insensitive',
        },
      },
      {
        description: {
          contains: q,
          mode: 'insensitive',
        },
      },
      {
        functions: {
          some: {
            tags: {
              some: {
                name: {
                  contains: q,
                  mode: 'insensitive',
                },
              },
            },
          }
        },
      },
    ];
  }

  // Define orderBy based on the sortBy query parameter
  const orderByQuery: Prisma.CollectionOrderByWithRelationInput = {};

  if ( sortKey === 'subscribers' ) {
    Object.assign(orderByQuery, {
      subscribers: {
        _count: sortOrder,
      },
    });
  }
  else {
    Object.assign(orderByQuery, {
      [sortKey]: sortOrder,
    });
  }

  const [totalCount, allCollections] = await Promise.all([
    // Fetch the total count of collections
    db.collection.count({
      where: whereQuery,
    }),

    // Fetch paginated collections
    db.collection.findMany({
      where: whereQuery,
      orderBy: orderByQuery,
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        owner: {
          select: {
            profile: {
              select: {
                id: true,
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
            functions: true,
          },
        },
        subscribers: {
          where: {
            userId: invokerUserId,
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

  const result: FetchCollectionSearchListPaginationType = {
    records: collectionsWithSubscriptionStatus,
    page: pageInt,
    pageSize: pageSizeInt,
    totalRecords,
    nbPages,
    hasNext,
    hasPrevious,
    q: q || '',
    sortBy
  };

  return result;
};
