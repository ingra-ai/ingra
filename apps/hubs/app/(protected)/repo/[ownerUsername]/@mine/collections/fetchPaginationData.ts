import clamp from 'lodash/clamp';
import db from '@repo/db/client';
import type { FetchMineCollectionListPaginationType } from '@repo/components/data/collections/mine/types';

export const fetchPaginationData = async (searchParams: Record<string, string | string[] | undefined> = {}, userId: string) => {
  // Parse the query parameteres
  let { page = '1' } = searchParams;
  page = Array.isArray(page) ? page[0] : page;

  // Validate and sanitize page and pageSize
  const pageInt = Number.isInteger(Number(page)) && Number(page) > 0 ? parseInt(page, 10) : 1;
  const pageSizeInt = 20;

  // Calculate skip value based on page and pageSize
  const skip = clamp(pageInt - 1, 0, 1e3) * pageSizeInt;

  const [totalCount, allcollections] = await Promise.all([
    // Fetch the total count of collections
    db.collection.count({
      where: {
        userId,
      },
    }),

    // Fetch paginated collections
    db.collection.findMany({
      where: {
        userId,
      },
      orderBy: {
        updatedAt: 'desc',
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        functions: {
          select: {
            id: true,
            slug: true,
            code: false,
            description: false,
            httpVerb: false,
            isPrivate: true,
            isPublished: true,
            ownerUserId: false,
            createdAt: false,
            updatedAt: false,
            tags: {
              select: {
                id: true,
                name: true,
                functionId: false,
                function: false,
              },
            },
            arguments: false,
          },
        },
        _count: {
          select: {
            subscribers: true,
          },
        },
      },
      skip,
      take: pageSizeInt,
    }),
  ]);

  // Calculate pagination details
  const totalRecords = totalCount;
  const nbPages = Math.ceil(totalRecords / pageSizeInt);
  const hasNext = skip + pageSizeInt < totalRecords;
  const hasPrevious = pageInt > 1;

  const result: FetchMineCollectionListPaginationType = {
    records: allcollections,
    page: pageInt,
    pageSize: pageSizeInt,
    totalRecords,
    nbPages,
    hasNext,
    hasPrevious,
  };

  return result;
};
