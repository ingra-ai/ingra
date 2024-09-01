import { getAuthSession } from '@repo/shared/data/auth/session';
import { notFound } from 'next/navigation';
import { BakaPagination } from '@repo/components/BakaPagination';
import { fetchPaginationData } from './fetchPaginationData';
import CollectionList from '@repo/components/data/collections/mine/CollectionList';

export default async function Page({ searchParams, params }: { searchParams: Record<string, string | string[] | undefined>; params: { ownerUsername: string } }) {
  const authSession = await getAuthSession();

  if (!authSession || !params.ownerUsername) {
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
        <BakaPagination className="mb-4" {...paginationProps} />
        <CollectionList ownerUsername={params.ownerUsername} collections={records} />
      </div>
    </div>
  );
}
