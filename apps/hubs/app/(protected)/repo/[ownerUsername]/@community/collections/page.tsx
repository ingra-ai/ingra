import { CollectionSearchList } from '@repo/components/data/collections';
import { BakaPagination } from '@repo/components/search/BakaPagination';
import { BakaSearch } from '@repo/components/search/BakaSearch';
import { getAuthSession } from '@repo/shared/data/auth/session';
import { fetchCollectionPaginationData } from '@repo/shared/data/collections';
import { getUserProfileByUsername } from '@repo/shared/data/profile';
import { notFound } from 'next/navigation';

type Props = {
  params: Promise<{ ownerUsername: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function Page(props: Props) {
  const [params, searchParams] = await Promise.all([
    props.params,
    props.searchParams,
  ]);
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

  const paginationData = await fetchCollectionPaginationData(searchParams, {
      invokerUserId: authSession?.userId || '',
      where: {
        userId: ownerProfile.userId,
        functions: {
          some: {
            isPublished: true,
            isPrivate: false,
          },
        },
      },
    }),
    { records, ...otherProps } = paginationData,

    // For Baka Search, the rest is for Baka Pagination
    { q, sortBy, ...paginationProps } = otherProps;

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
