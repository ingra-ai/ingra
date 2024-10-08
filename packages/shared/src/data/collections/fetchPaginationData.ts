'use server';
import clamp from 'lodash/clamp';
import db from '@repo/db/client';
import { Prisma } from '@repo/db/prisma';

type FetchCollectionPaginationDataOptions = {
  /**
   * The invoker user ID
   * if this value is provided, the function will return the subscription status of the user for each function
   */
  invokerUserId?: string;

  /**
   * The where query to filter the functions
   */
  where?: Prisma.CollectionWhereInput;
}

export async function fetchPaginationData(searchParams: Record<string, string | string[] | undefined> = {}, options: FetchCollectionPaginationDataOptions = {}) {
  const { 
    invokerUserId = '',
    where: argsWhere = {},
  } = options;

  // Define available sort keys and orders
  const availableSortKeys = ['name', 'updatedAt', 'subscribers'],
    availableSortOrders = ['asc', 'desc'];

  // Parse the query parameteres
  const q = ( Array.isArray(searchParams?.q) ? searchParams.q[0] : '' ) || '';
  const page = ( Array.isArray(searchParams?.page) ? searchParams.page[0] : '1' ) || '1';
  const pageSize = ( Array.isArray(searchParams?.pageSize) ? searchParams.pageSize[0] : '20' ) || '20';
  let sortBy = ( Array.isArray(searchParams?.sortBy) ? searchParams.sortBy[0] : 'updatedAt_desc' ) || 'updatedAt_desc';

  // Validate and sanitize page and pageSize
  const pageInt = Number.isInteger(Number(page)) && Number(page) > 0 ? parseInt(page, 10) : 1;
  const pageSizeInt = clamp(Number.isInteger(Number(pageSize)) ? parseInt(pageSize, 10) : 20, 1, 40);

  // Calculate skip value based on page and pageSize
  const skip = clamp(pageInt - 1, 0, 1e3) * pageSizeInt;

  // Calculate orderBy based on sortBy
  let [sortKey, sortOrder] = sortBy.split('_');
  if (!sortKey || !sortOrder || !availableSortKeys.includes(sortKey) || !availableSortOrders.includes(sortOrder)) {
    // Revert to default values if the sortBy query parameter is invalid
    sortBy = 'updatedAt_desc';
    sortKey = 'updatedAt';
    sortOrder = 'desc';
  }

  // Define whereQuery based on the query parameteres 'q' and argument 'ownerUserId'
  const whereQuery: Prisma.CollectionWhereInput = {
    ...argsWhere,
  };

  // Apply search query
  if (q) {
    whereQuery.OR = [
      ...(whereQuery?.OR || []),
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
          },
        },
      },
    ];
  }

  // Define orderBy based on the sortBy query parameter
  const orderByQuery: Prisma.CollectionOrderByWithRelationInput = {};

  if (sortKey === 'subscribers') {
    Object.assign(orderByQuery, {
      subscribers: {
        _count: sortOrder,
      },
    });
  } else {
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
        subscribers: invokerUserId ? {
          where: {
            userId: invokerUserId,
          },
          select: {
            id: true,
          },
        } : false,
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

  const result = {
    records: collectionsWithSubscriptionStatus,
    page: pageInt,
    pageSize: pageSizeInt,
    totalRecords,
    nbPages,
    hasNext,
    hasPrevious,
    q: q || '',
    sortBy,
  };

  return result;
}

export type FetchCollectionPaginationDataReturnType = Awaited<ReturnType<typeof fetchPaginationData>>;

