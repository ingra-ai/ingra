import { getAuthSession } from '@repo/shared/data/auth/session';
import { notFound } from 'next/navigation';
import { BakaPagination } from '@repo/components/BakaPagination';
import { fetchPaginationData } from './fetchPaginationData';
import CollectionList from '@repo/components/data/collections/mine/CollectionList';
import CollectionSearchList from '@repo/components/data/collections/CollectionSearchList';
import CreateNewCollectionButton from './CreateNewCollectionButton';

export default async function Page({ searchParams, params }: { searchParams: Record<string, string | string[] | undefined>; params: { ownerUsername: string } }) {
  const authSession = await getAuthSession();

  if (!authSession || !params.ownerUsername) {
    return notFound();
  }

  const paginationData = await fetchPaginationData(searchParams, authSession.user.id),
    { records, ...paginationProps } = paginationData;

  return (
    <div className="block" data-testid="collections-list-page">
      
      <div className="flex justify-between items-center mb-4">
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
        <CreateNewCollectionButton />
      </div>
      <div className="mt-4">
        <BakaPagination className="mb-4" {...paginationProps} />
        <CollectionSearchList authSession={authSession} collections={records} />
      </div>
    </div>
  );
}
