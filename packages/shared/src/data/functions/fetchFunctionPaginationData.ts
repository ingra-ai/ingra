'use server';
import clamp from 'lodash/clamp';
import db from '@repo/db/client';
import { Prisma } from '@repo/db/prisma';

type FetchFunctionPaginationDataOptions<S extends Prisma.FunctionSelect> = {
  /**
   * The invoker user ID
   * if this value is provided, the function will return the subscription status of the user for each function
   */
  invokerUserId?: string;

  /**
   * The where query to filter the functions
   */
  where?: Prisma.FunctionWhereInput;

  /**
   * The select query to filter the fields to be returned 
   */
  select?: S;
}

export async function fetchFunctionPaginationData<S extends Prisma.FunctionSelect>(
  searchParams: Record<string, string | string[] | undefined> = {},
  options: FetchFunctionPaginationDataOptions<S> = {}
) {
  const { 
    invokerUserId = '',
    where: argsWhere = {},
    select: argsSelect = {},
  } = options;

  // Define available sort keys and orders
  const availableSortKeys = ['slug', 'updatedAt', 'subscribers'],
    availableSortOrders = ['asc', 'desc'];

  // Parse the query parameteres
  const q = ( Array.isArray(searchParams?.q) ? searchParams.q[0] : searchParams.q ) || '';
  const page = ( Array.isArray(searchParams?.page) ? searchParams.page[0] : searchParams.page ) || '1';
  const pageSize = ( Array.isArray(searchParams?.pageSize) ? searchParams.pageSize[0] : searchParams.pageSize ) || '20';
  let sortBy = ( Array.isArray(searchParams?.sortBy) ? searchParams.sortBy[0] : searchParams.sortBy ) || 'updatedAt_desc';

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
  const whereQuery: Prisma.FunctionWhereInput = {
    ...argsWhere,
  };

  // Apply search query
  if (q) {
    whereQuery.OR = [
      ...(whereQuery?.OR || []),
      {
        slug: {
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
    ];
  }

  // Define orderBy based on the sortBy query parameter
  const orderByQuery: Prisma.FunctionOrderByWithRelationInput = {};

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

  // Define the select query based on the argument 'select'
  const selectQuery: Prisma.FunctionSelect = {
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
    _count: {
      select: {
        subscribers: true,
      },
    },
    ...argsSelect,
  };

  // Include the subscribers field if the invokerUserId is provided
  if ( invokerUserId ) {
    Object.assign(selectQuery, {
      subscribers: {
        where: {
          userId: invokerUserId,
        },
        select: {
          id: true,
        },
      },
    });
  }

  const [totalCount, allFunctions] = await Promise.all([
    // Fetch the total count of functions
    db.function.count({
      where: whereQuery,
    }),

    // Fetch paginated functions
    db.function.findMany({
      where: whereQuery,
      orderBy: orderByQuery,
      select: selectQuery,
      skip,
      take: pageSizeInt,
    }),
  ]);

  // Transform the `subscribers` field into a boolean `isSubscribed`
  const functionsWithSubscriptionStatus = allFunctions.map((functionRecord) => ({
    id: functionRecord.id,
    slug: functionRecord.slug,
    code: functionRecord?.code || '',
    description: functionRecord.description,
    httpVerb: functionRecord.httpVerb,
    ownerUserId: functionRecord.ownerUserId,
    owner: {
      id: functionRecord.owner?.id || functionRecord.ownerUserId,
      profile: {
        userName: ( functionRecord.owner as any )?.profile?.userName || null,
      },
    },
    subscribers: functionRecord?.subscribers || [],
    tags: functionRecord?.tags || [],
    arguments: functionRecord?.arguments || [],
    createdAt: functionRecord.createdAt || null,
    updatedAt: functionRecord.updatedAt || null,
    _count: functionRecord._count || { subscribers: 0 },
    isSubscribed: Array.isArray(functionRecord?.subscribers) && functionRecord.subscribers.length > 0,
  }));

  // Calculate pagination details
  const totalRecords = totalCount;
  const nbPages = Math.ceil(totalRecords / pageSizeInt);
  const hasNext = skip + pageSizeInt < totalRecords;
  const hasPrevious = pageInt > 1;

  const result = {
    records: functionsWithSubscriptionStatus,
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

export type FetchFunctionPaginationDataReturnType = Awaited<ReturnType<typeof fetchFunctionPaginationData>>;

