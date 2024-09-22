import { getAuthSession } from '@repo/shared/data/auth/session';
import { notFound } from 'next/navigation';
import { getUserRepoFunctionsEditUri } from '@repo/shared/lib/constants/repo';
import CollectionViewDetails from '@repo/components/data/collections/mine/CollectionViewDetails';
import { FunctionItem } from '@repo/components/data/functions/mine/FunctionItem';
import { getCollectionAccessibleByUser } from '@repo/shared/data/collections/getCollectionAccessibleByUser';
import { Metadata, ResolvingMetadata } from 'next';
import { APP_NAME } from '@repo/shared/lib/constants';

type Props = {
  params: { ownerUsername: string; recordIdOrSlug: string }
  searchParams: { [key: string]: string | string[] | undefined }
}

export async function generateMetadata(
  { params, searchParams }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { ownerUsername, recordIdOrSlug } = params;
 
  return {
    title: [`${ownerUsername}'s ${ recordIdOrSlug } Collection`, APP_NAME].join(' | '),
  }
}

export default async function Page({ params }: Props) {
  const authSession = await getAuthSession();
  const { ownerUsername, recordIdOrSlug } = params;

  if (!recordIdOrSlug || !authSession || !ownerUsername) {
    return notFound();
  }

  const collectionRecord = await getCollectionAccessibleByUser(authSession.user.id, recordIdOrSlug, {
    accessTypes: ['owner'],
    findFirstArgs: {
      include: {
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
          },
        }
      },
    },
  })

  if (!collectionRecord) {
    return notFound();
  }

  return (
    <div className="block" data-testid="collections-view-page">
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-12 gap-6">
        <div className="col-span-1 md:col-span-1 xl:col-span-4 space-y-4">
          <CollectionViewDetails ownerUsername={ownerUsername} record={collectionRecord} />
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
            {collectionRecord.functions.map((functionRecord) => (
              <FunctionItem key={functionRecord.id} functionData={functionRecord} href={getUserRepoFunctionsEditUri(ownerUsername, functionRecord.id)} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
