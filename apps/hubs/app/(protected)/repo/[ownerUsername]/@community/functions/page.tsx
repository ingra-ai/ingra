import { getAuthSession } from '@repo/shared/data/auth/session';
import CommunityFunctionList from '@repo/components/data/functions/community/CommunityFunctionList';
import { cn } from '@repo/shared/lib/utils';
import { notFound } from 'next/navigation';
import { BakaPagination } from '@repo/components/BakaPagination';
import { fetchPaginationData } from './fetchPaginationData';
import { getUserProfileByUsername } from '@repo/shared/data/profile';

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

  const paginationData = await fetchPaginationData(searchParams, ownerProfile.userId, authSession?.userId),
    { records, ...paginationProps } = paginationData;

  const functionListGridClasses = cn({
    'grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6': true,
  });

  return (
    <div className="block" data-testid="collections-community-page">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold leading-6">{ownerUsername}&apos;s Functions</h1>
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
        <div className={functionListGridClasses}>{records.length > 0 && <CommunityFunctionList showControls={!!authSession} functionRecords={records} />}</div>
      </div>
    </div>
  );
}
