import { getAuthSession } from '@repo/shared/data/auth/session';
import { notFound } from 'next/navigation';
import { BakaPagination } from '@repo/components/search/BakaPagination';
import { Metadata, ResolvingMetadata } from 'next';
import { APP_NAME } from '@repo/shared/lib/constants';
import { FunctionSearchList } from '@repo/components/data/functions';
import { BakaSearch } from '@repo/components/search/BakaSearch';
import { fetchFunctionPaginationData } from '@repo/shared/data/functions';
import { CreateNewFunctionButton } from '@repo/components/data/functions';

type Props = {
  params: { ownerUsername: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata({ params, searchParams }: Props, parent: ResolvingMetadata): Promise<Metadata> {
  const { ownerUsername } = params;

  return {
    title: ['My Functions', APP_NAME].join(' | '),
  };
}

export default async function Page({ searchParams, params }: Props) {
  const authSession = await getAuthSession();

  if (!authSession) {
    return notFound();
  }

  const paginationData = await fetchFunctionPaginationData(searchParams, {
      where: {
        ownerUserId: authSession.userId,
      }
    }),
    { records, ...otherProps } = paginationData,
    // For Baka Search, the rest is for Baka Pagination
    { q, sortBy, ...paginationProps } = otherProps;

  return (
    <div className="block" data-testid="functions-list-page">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold leading-6">My Functions</h1>
          <p className="text-xs text-gray-500 font-sans mt-1">
            # records:{' '}
            <strong>
              {paginationProps.totalRecords.toLocaleString(undefined, {
                minimumFractionDigits: 0,
              })}
            </strong>
          </p>
        </div>
        <CreateNewFunctionButton authSession={authSession} ownerUsername={params.ownerUsername} />
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
