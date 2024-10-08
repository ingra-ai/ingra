import { getAuthSession } from '@repo/shared/data/auth/session';
import { notFound } from 'next/navigation';
import { BakaPagination } from '@repo/components/search/BakaPagination';
import { getUserProfileByUsername } from '@repo/shared/data/profile';
import { fetchFunctionPaginationData } from '@repo/shared/data/functions';
import { FunctionSearchList } from '@repo/components/data/functions';
import { BakaSearch } from '@repo/components/search/BakaSearch';

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

  const paginationData = await fetchFunctionPaginationData(searchParams, {
      invokerUserId: authSession?.userId || '',
      where: {
        ownerUserId: ownerProfile.userId,
        isPublished: true,
        isPrivate: false,
      }
    }),
    { records, ...otherProps } = paginationData,
    // For Baka Search, the rest is for Baka Pagination
    { q, sortBy, ...paginationProps } = otherProps;

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
