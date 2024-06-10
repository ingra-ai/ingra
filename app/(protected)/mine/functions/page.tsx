import { getAuthSession } from '@app/auth/session';
import FunctionsList from './FunctionList';
import { cn } from '@lib/utils';
import { notFound } from 'next/navigation';
import type { FetchFunctionListPaginationType } from '@protected/mine/functions/types';
import { BakaPagination } from '@components/BakaPagination';
import clamp from 'lodash/clamp';
import db from '@lib/db';

const fetchPaginationData = async (searchParams: Record<string, string | string[] | undefined> = {}, userId: string) => {
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
        ownerUserId: userId,
      },
    }),

    // Fetch paginated functions
    db.function.findMany({
      where: {
        ownerUserId: userId,
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
        updatedAt: true,
        tags: {
          select: {
            id: true,
            name: true,
          },
        },
        arguments: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        }
      },
      skip,
      take: pageSizeInt,
    }),
  ]);

  // Calculate pagination details
  const totalRecords = totalCount;
  const nbPages = Math.ceil(totalRecords / pageSizeInt);
  const hasNext = (skip + pageSizeInt) < totalRecords;
  const hasPrevious = pageInt > 1;

  const result: FetchFunctionListPaginationType = {
    records: allFunctions,
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

  const [paginationData, collections] = await Promise.all([
      fetchPaginationData(searchParams, authSession.user.id),

      // Fetch all collections for the user
      db.collection.findMany({
        where: {
          userId: authSession.user.id,
        },
        select: {
          id: true,
          name: true,
          slug: true,
          description: false,
          functions: {
            select: {
              id: true,
              slug: true
            }
          }
        },
      })
    ]),
    { records, ...paginationProps } = paginationData;

  const functionListGridClasses = cn({
    'grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6': true
  });

  return (
    <div className="block" data-testid="functions-list-page">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold leading-6">My Functions</h1>
          <p className="text-xs text-gray-500 font-sans mt-1">
            # records: <strong>{paginationProps.totalRecords.toLocaleString(undefined, { minimumFractionDigits: 0 })}</strong>
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
        </div>
      </div>
      <div className="mt-4">
        <BakaPagination className="mb-4" { ...paginationProps } />
        <div className={functionListGridClasses}>
          {
            <FunctionsList functions={records} collections={collections} />
          }
        </div>
      </div>
    </div>
  );
}
