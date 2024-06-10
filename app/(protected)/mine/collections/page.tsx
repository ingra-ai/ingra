import { getAuthSession } from '@app/auth/session';
import { notFound } from 'next/navigation';
import type { FetchCollectionListPaginationType } from '@protected/mine/collections/types';
import { BakaPagination } from '@components/BakaPagination';
import clamp from 'lodash/clamp';
import db from '@lib/db';
import CollectionList from './CollectionList';

const fetchPaginationData = async (searchParams: Record<string, string | string[] | undefined> = {}, userId: string) => {
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
              }
            },
            arguments: false
          },
        },
        _count: {
          select: {
            subscribers: true,
          }
        }
      },
      skip,
      take: pageSizeInt,
    })
  ]);

  // Calculate pagination details
  const totalRecords = totalCount;
  const nbPages = Math.ceil(totalRecords / pageSizeInt);
  const hasNext = (skip + pageSizeInt) < totalRecords;
  const hasPrevious = pageInt > 1;

  const result: FetchCollectionListPaginationType = {
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

export default async function Page(
  { searchParams }: {
    searchParams: Record<string, string | string[] | undefined>
  }
) {
  const authSession = await getAuthSession();
  
  if ( !authSession ) {
    return notFound();
  }

  const paginationData = await fetchPaginationData(searchParams, authSession.user.id),
    { records, ...paginationProps } = paginationData;

  return (
    <div className="block" data-testid="collections-list-page">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold leading-6">My Collections</h1>
          <p className="text-xs text-gray-500 font-sans mt-1">
            # records: <strong>{paginationProps.totalRecords.toLocaleString(undefined, { minimumFractionDigits: 0 })}</strong>
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
        </div>
      </div>
      <div className="mt-4">
        <BakaPagination className="mb-4" { ...paginationProps } />
        <CollectionList collections={records} />
      </div>
    </div>
  );
}
