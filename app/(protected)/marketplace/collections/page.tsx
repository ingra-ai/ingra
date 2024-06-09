import { getAuthSession } from '@app/auth/session';
import { notFound } from 'next/navigation';
import type { FetchCollectionMarketplacePaginationType } from '@protected/marketplace/collections/types';
import { BakaPagination } from '@components/BakaPagination';
import clamp from 'lodash/clamp';
import db from '@lib/db';
import MarketplaceCollectionList from './MarketplaceCollectionList';
import { cn } from '@lib/utils';

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
              }
            }
          }
        },
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

  const result: FetchCollectionMarketplacePaginationType = {
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


  const [paginationData, subscribedCollections] = await Promise.all([
    fetchPaginationData(searchParams, authSession.user.id),

    // Fetch all collections that the user have subscribed to
    db.collectionSubscription.findMany({
      where: {
        userId: authSession.user.id,
      },
      select: {
        collectionId: true,
      },
    })
  ]),
    { records, ...paginationProps } = paginationData;

  const classes = cn('block');

  return (
    <div className={ classes } data-testid="marketplace-collections-page">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold leading-6">Collections Marketplace</h1>
          <p className="text-xs text-gray-500 font-sans mt-1">
            # records: <strong>{paginationProps.totalRecords.toLocaleString(undefined, { minimumFractionDigits: 0 })}</strong>
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
        </div>
      </div>
      <div className="mt-4">
        <BakaPagination className="mb-4" {...paginationProps} />
        <MarketplaceCollectionList collections={records} subscribedCollections={subscribedCollections} />
      </div>
    </div>
  );
}
