import { getAuthSession } from '@repo/shared/data/auth/session';
import { BakaPagination } from '@repo/components/BakaPagination';
import { cn } from '@repo/shared/lib/utils';
import { fetchPaginationData } from './fetchPaginationData';
import CollectionSearchList from '@repo/components/data/collections/CollectionSearchList';

export default async function Page({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  const authSession = await getAuthSession();

  const paginationData = await fetchPaginationData(searchParams, authSession?.userId),
    { records, ...paginationProps } = paginationData;

  const classes = cn('block');

  return (
    <div className={classes} data-testid="marketplace-collections-page">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold leading-6">Collections Marketplace</h1>
          <p className="text-xs text-gray-500 font-sans mt-1">
            # records:{' '}
            <strong>
              {paginationProps.totalRecords.toLocaleString(undefined, {
                minimumFractionDigits: 0,
              })}
            </strong>
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none"> </div>
      </div>
      <div className="mt-4">
        <BakaPagination className="mb-4" {...paginationProps} />
        <CollectionSearchList authSession={authSession} collections={records} />
      </div>
    </div>
  );
}
