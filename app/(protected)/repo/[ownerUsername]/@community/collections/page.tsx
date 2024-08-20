import { notFound } from 'next/navigation';
import { BakaPagination } from '@components/BakaPagination';
import { fetchPaginationData } from './fetchPaginationData';
import { getUserProfileByUsername } from '@data/profile';
import { getAuthSession } from '@app/auth/session';
import CommunityCollectionList from '@components/data/collections/CommunityCollectionList';

export default async function Page(
  { searchParams, params }: {
    searchParams: Record<string, string | string[] | undefined>;
    params: { ownerUsername: string };
  }
) {
  const { ownerUsername } = params;

  const [ownerProfile, authSession] = await Promise.all([

    // Get userId from ownerUsername
    getUserProfileByUsername(ownerUsername),

    // Get current user session
    getAuthSession()
  ]);

  if (!ownerProfile?.userId || !ownerUsername) {
    return notFound();
  }

  const paginationData = await fetchPaginationData(searchParams, ownerProfile?.userId, authSession?.userId),
    { records, ...paginationProps } = paginationData;

  return (
    <div className="block" data-testid="collections-community-page">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold leading-6">{ownerUsername}&apos;s Collections</h1>
          <p className="text-xs text-gray-500 font-sans mt-1">
            # records: <strong>{paginationProps.totalRecords.toLocaleString(undefined, { minimumFractionDigits: 0 })}</strong>
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
        </div>
      </div>
      <div className="mt-4">
        <BakaPagination className="mb-4" {...paginationProps} />
        <CommunityCollectionList showControls={ !!authSession } collections={records} />
      </div>
    </div>
  );
}
