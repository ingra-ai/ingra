import { getAuthSession } from '@repo/shared/data/auth/session';
import { notFound } from 'next/navigation';
import { getCollectionAccessibleByUser } from '@repo/shared/data/collections';
import { Metadata, ResolvingMetadata } from 'next';
import { APP_NAME } from '@repo/shared/lib/constants';
import { FunctionSearchList } from '@repo/components/data/functions';
import { fetchFunctionPaginationData } from '@repo/shared/data/functions';
import { BakaSearch } from '@repo/components/search/BakaSearch';
import { BakaPagination } from '@repo/components/search/BakaPagination';
import { CollectionDetailView } from '@repo/components/data/collections';

type Props = {
  params: { ownerUsername: string; recordIdOrSlug: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata({ params, searchParams }: Props, parent: ResolvingMetadata): Promise<Metadata> {
  const { ownerUsername, recordIdOrSlug } = params;

  return {
    title: [`${ownerUsername}'s ${recordIdOrSlug} Collection`, APP_NAME].join(' | '),
  };
}

export default async function Page({ searchParams, params }: Props) {
  const authSession = await getAuthSession();
  const { ownerUsername, recordIdOrSlug } = params;

  if (!recordIdOrSlug || !authSession || !ownerUsername) {
    return notFound();
  }

  const collectionRecord = await getCollectionAccessibleByUser(ownerUsername, recordIdOrSlug, {
    accessTypes: ['owner'],
    findFirstArgs: {
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        updatedAt: true,
        owner: {
          select: {
            id: true,
            profile: {
              select: {
                userName: true,
              },
            },
          },
        },
      },
    },
  });

  if (!collectionRecord || !collectionRecord.id) {
    return notFound();
  }

  const paginationData = await fetchFunctionPaginationData(searchParams, {
      invokerUserId: authSession?.userId || '',
      where: {
        ownerUserId: authSession?.userId || '',
        collectors: {
          some: {
            id: collectionRecord.id
          }
        }
      }
    }),
    { records, ...otherProps } = paginationData,
    // For Baka Search, the rest is for Baka Pagination
    { q, sortBy, ...paginationProps } = otherProps;

  return (
    <div className="block" data-testid="collections-view-page">
      <div className="flex flex-col space-y-6">
        <div className="">
          <CollectionDetailView authSession={authSession} record={collectionRecord} />
        </div>
        <div className="">
          <div className="sm:flex sm:items-center">
            <div className="sm:flex-auto">
              <h1 className="text-base font-semibold leading-6">Functions</h1>
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
      </div>
    </div>
  );
}
