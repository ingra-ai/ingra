'use server';
import { getAuthSession } from '@repo/shared/data/auth/session';
import { cn } from '@repo/shared/lib/utils';
import { BakaPagination } from '@repo/components/search/BakaPagination';
import { BakaSearch } from '@repo/components/search/BakaSearch';
import { FunctionSearchList } from '@repo/components/data/functions';
import { fetchFunctionPaginationData } from '@repo/shared/data/functions';

export default async function Page({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  const authSession = await getAuthSession();

  const paginationData = await fetchFunctionPaginationData(searchParams, {
      invokerUserId: authSession?.userId || '',
      where: {
        ...(authSession?.userId ? { NOT: { ownerUserId: authSession.userId } } : {}),
        isPublished: true,
        isPrivate: false,
      }
    }),
    { records, ...otherProps } = paginationData,
    // For Baka Search, the rest is for Baka Pagination
    { q, sortBy, ...paginationProps } = otherProps;

  const classes = cn('block');

  return (
    <div className={classes} data-testid="marketplace-functions-page">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold leading-6">Functions Marketplace</h1>
          <p className="text-xs text-gray-500 font-sans mt-1">
            # records:{' '}
            <strong>
              {paginationProps.totalRecords.toLocaleString(undefined, {
                minimumFractionDigits: 0,
              })}
            </strong>
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none"></div>
      </div>
      <div className="mt-4">
        <BakaSearch
          className="mb-4"
          q={q}
          sortBy={sortBy}
          sortItems={[
            { key: 'updatedAt_desc', title: 'Last Updated' },
            { key: 'subscribers_desc', title: 'Most Subscribed' },
            { key: 'slug_asc', title: 'Slug (A-Z)' },
            { key: 'slug_desc', title: 'Slug (Z-A)' },
          ]}
        />
        <BakaPagination className="mb-4" {...paginationProps} />
        <FunctionSearchList authSession={authSession} functions={records} />
      </div>
    </div>
  );
}
