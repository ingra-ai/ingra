import { ResolvingMetadata, Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAuthSession } from '@repo/shared/data/auth/session';
import { CommunityFunctionItem } from '@repo/components/data/functions/community/CommunityFunctionItem';
import CommunityCollectionViewDetails from '@repo/components/data/collections/community/CommunityCollectionViewDetails';
import { getUserProfileByUsername } from '@repo/shared/data/profile';
import { getUserRepoFunctionsViewUri } from '@repo/shared/lib/constants/repo';
import { getCollectionAccessibleByUser } from '@repo/shared/data/collections';
import { APP_NAME } from '@repo/shared/lib/constants';

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

export default async function Page({ params }: Props) {
  const { recordIdOrSlug, ownerUsername } = params;

  if (!recordIdOrSlug) {
    return notFound();
  }

  const [ownerProfile, authSession] = await Promise.all([
    // Get userId from ownerUsername
    getUserProfileByUsername(ownerUsername),

    // Get current user session
    getAuthSession(),
  ]);

  if (!ownerProfile?.userId || !ownerUsername) {
    return notFound();
  }

  const callerUserId = authSession?.user.id,
    ownerUserId = ownerProfile.userId;

  const collectionRecord = await getCollectionAccessibleByUser(ownerUserId, recordIdOrSlug, {
    accessTypes: ['marketplace'],
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
        functions: {
          select: {
            id: true,
            slug: true,
            code: false,
            description: true,
            httpVerb: true,
            isPrivate: true,
            isPublished: true,
            ownerUserId: true,
            createdAt: false,
            updatedAt: true,
            tags: {
              select: {
                id: true,
                name: true,
                functionId: false,
                function: false,
              },
            },
            arguments: {
              select: {
                id: true,
                name: true,
                description: false,
                type: true,
                defaultValue: false,
                isRequired: false,
              },
            },
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
            ...(callerUserId !== ownerUserId
              ? {
                  subscribers: {
                    where: {
                      userId: callerUserId,
                    },
                    select: {
                      id: true,
                    },
                  },
                }
              : {}),
          },
        },
      },
    },
  });

  if (!collectionRecord) {
    return notFound();
  }

  // Transform the `subscribers` field into a boolean `isSubscribed`
  const functionsWithSubscriptionStatus = collectionRecord.functions.map((functionRecord) => ({
    ...functionRecord,
    isSubscribed: Array.isArray(functionRecord?.subscribers) && functionRecord.subscribers.length > 0,
  }));

  return (
    <div className="block" data-testid="community-collection-view-page">
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-12 gap-6">
        <div className="col-span-1 md:col-span-1 xl:col-span-4 space-y-4">
          <CommunityCollectionViewDetails record={collectionRecord} />
        </div>
        <div className="col-span-1 md:col-span-2 xl:col-span-8 space-y-4">
          <h2 className="text-lg font-bold text-gray-100 truncate min-w-0" title={'Functions'}>
            Functions (
            {collectionRecord.functions.length.toLocaleString(undefined, {
              minimumFractionDigits: 0,
            })}
            )
          </h2>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3 xl:gap-3 2xl:grid-cols-4 2xl:gap-4">
            {functionsWithSubscriptionStatus.map((functionRecord) => (
              <CommunityFunctionItem key={functionRecord.id} functionData={functionRecord} href={getUserRepoFunctionsViewUri(ownerUsername, functionRecord.slug)} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
