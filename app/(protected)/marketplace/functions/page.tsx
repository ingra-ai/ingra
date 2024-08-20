'use server';
import { getAuthSession } from '@app/auth/session';
import { cn } from '@lib/utils';
import { BakaPagination } from '@components/BakaPagination';
import CommunityFunctionList from '@components/data/functions/CommunityFunctionList';
import { fetchPaginationData } from './fetchPaginationData';

export default async function Page(
  { searchParams }: {
    searchParams: Record<string, string | string[] | undefined>
  }
) {
  const authSession = await getAuthSession();

  const paginationData = await fetchPaginationData(searchParams, authSession?.userId || 'guest'),
    { records, ...paginationProps } = paginationData;

  const classes = cn('block'),
    gridClasses = cn({
      'grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6': true
    });

  return (
    <div className={classes} data-testid="marketplace-functions-page">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold leading-6">Functions Marketplace</h1>
          <p className="text-xs text-gray-500 font-sans mt-1">
            # records: <strong>{paginationProps.totalRecords.toLocaleString(undefined, { minimumFractionDigits: 0 })}</strong>
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
        </div>
      </div>
      <div className="mt-4">
        <BakaPagination className="mb-4" {...paginationProps} />
        <div className={gridClasses}>
          {
            records.length > 0 && (
              <CommunityFunctionList showControls={ !!authSession } functionRecords={records} />
            )
          }
        </div>
      </div>
    </div>
  );
}
