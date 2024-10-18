import { CollectionSearchList, CreateNewCollectionButton } from '@repo/components/data/collections';
import { BakaPagination } from '@repo/components/search/BakaPagination';
import { BakaSearch } from '@repo/components/search/BakaSearch';
import { getAuthSession } from '@repo/shared/data/auth/session';
import { fetchCollectionPaginationData } from '@repo/shared/data/collections';
import { notFound } from 'next/navigation';

export default async function Page({ searchParams, params }: { searchParams: Record<string, string | string[] | undefined>; params: { ownerUsername: string } }) {
  const authSession = await getAuthSession();

  if (!authSession || !params.ownerUsername) {
    return notFound();
  }

  const paginationData = await fetchCollectionPaginationData(searchParams, {
      where: {
        userId: authSession.userId,
      },
    }),
    { records, ...otherProps } = paginationData,

    // For Baka Search, the rest is for Baka Pagination
    { q, sortBy, ...paginationProps } = otherProps;

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
        <BakaSearch
          className="mb-4"
          q={ q }
          sortBy={ sortBy }
          sortItems={[
            { key: 'updatedAt_desc', title: 'Last Updated' },
            { key: 'subscribers_desc', title: 'Most Subscribed' },
            { key: 'name_asc', title: 'Name (A-Z)' },
            { key: 'name_desc', title: 'Name (Z-A)' },
          ]}
        />
        <BakaPagination className="mb-4" {...paginationProps} />
        <CollectionSearchList authSession={authSession} collections={records} />
      </div>
    </div>
  );
}
