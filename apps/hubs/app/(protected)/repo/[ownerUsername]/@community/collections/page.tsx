import { notFound } from 'next/navigation';
import { BakaPagination } from '@repo/components/BakaPagination';
import { fetchPaginationData } from '@protected/marketplace/collections/fetchPaginationData';
import { getUserProfileByUsername } from '@repo/shared/data/profile';
import { getAuthSession } from '@repo/shared/data/auth/session';
import CollectionSearchList from '@repo/components/data/collections/CollectionSearchList';

export default async function Page({ searchParams, params }: { searchParams: Record<string, string | string[] | undefined>; params: { ownerUsername: string } }) {
  const { ownerUsername } = params;

  const [ownerProfile, authSession] = await Promise.all([
    // Get userId from ownerUsername
    getUserProfileByUsername(ownerUsername),

    // Get current user session
    getAuthSession(),
  ]);

  if (!ownerProfile?.userId || !ownerUsername) {
    return notFound();
  }

  const paginationData = await fetchPaginationData(searchParams, authSession?.userId, ownerProfile?.userId),
    { records, ...paginationProps } = paginationData;

  return (
    <div className="block" data-testid="collections-community-page">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold leading-6">{ownerUsername}&apos;s Collections</h1>
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
        <CollectionSearchList authSession={authSession} collections={records} />
      </div>
    </div>
  );
}
