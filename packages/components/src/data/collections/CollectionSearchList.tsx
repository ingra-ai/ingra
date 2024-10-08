'use client';
import React, { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@repo/components/ui/use-toast';
import { unsubscribeToCollection, subscribeToCollection, deleteCollection } from '@repo/shared/actions/collections';
import { cn } from '@repo/shared/lib/utils';
import type { CollectionCardPayload } from './types';
import CollectionCard from './CollectionCard';
import { getUserRepoCollectionsViewUri } from '@repo/shared/lib/constants/repo';
import type { AuthSessionResponse } from '@repo/shared/data/auth/session/types';
import type { FetchCollectionPaginationDataReturnType } from '@repo/shared/data/collections';

interface CollectionSearchListProps extends React.HTMLAttributes<HTMLDivElement> {
  authSession?: AuthSessionResponse | null;
  collections: FetchCollectionPaginationDataReturnType['records'];
}

export const CollectionSearchList: React.FC<CollectionSearchListProps> = (props) => {
  const { authSession, collections, ...divProps } = props;
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleSubscribe = async (collection: CollectionCardPayload) => {
    return subscribeToCollection(collection.id)
      .then((result) => {
        if (result.status !== 'ok') {
          throw new Error(result.message);
        }

        toast({
          title: 'Success!',
          description: result?.message || 'Collection has been subscribed successfully.',
        });

        startTransition(router.refresh);
      })
      .catch((error) => {
        toast({
          variant: 'destructive',
          title: 'Uh oh! Something went wrong.',
          description: error?.message || 'Failed to subscribe',
        });
      });
  };

  const handleUnsubscribe = async (collection: CollectionCardPayload) => {
    // Prompt user
    const confirmed = confirm(`Are you sure to unsubscribe to this collection? Unsubscribing will remove all the functions in it accessible from you.`);

    if (confirmed) {
      return unsubscribeToCollection(collection.id)
        .then((result) => {
          if (result.status !== 'ok') {
            throw new Error(result.message);
          }

          toast({
            title: 'Success!',
            description: result.message || 'Collection has been unsubscribed.',
          });

          startTransition(router.refresh);
        })
        .catch((error) => {
          toast({
            variant: 'destructive',
            title: 'Uh oh! Something went wrong.',
            description: error?.message || 'Failed to unsubscribe.',
          });
        });
    }

    return Promise.reject();
  };

  const handleDelete = (collection: CollectionCardPayload) => {
    // Prompt user
    const confirmed = confirm(`Are you sure to delete this collection? Removing this will just remove the collection and your functions will only be disconnected from it.`);

    if (confirmed) {
      return deleteCollection(collection.id)
        .then((result) => {
          if (result.status !== 'ok') {
            throw new Error(result.message);
          }

          toast({
            title: 'Success!',
            description: 'Collection has been deleted successfully.',
          });

          startTransition(router.refresh);
        })
        .catch((error) => {
          toast({
            variant: 'destructive',
            title: 'Uh oh! Something went wrong.',
            description: error?.message || 'Failed to delete collection!',
          });
        });
    }

    return Promise.reject();
  };

  const classes = cn('relative', divProps.className),
    collectionListGridClasses = cn({
      'grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3': true,
    });

  return (
    <div data-testid="collection-search-list" {...divProps} className={classes}>
      <div className="mx-auto space-y-6">
        <div className={collectionListGridClasses}>
          {collections.map((collection) => {
            const isSubscribed = collection.isSubscribed,
              href = getUserRepoCollectionsViewUri(collection.owner.profile?.userName || '', collection.slug),
              refinedCollectionCardProps: Partial<React.ComponentProps<typeof CollectionCard>> = {};

            // If user is the owner of this collection, allow deletion
            if (authSession?.user?.profile?.userName && authSession.user.profile.userName === collection.owner.profile?.userName) {
              refinedCollectionCardProps.handleDelete = handleDelete;
            } else {
              if (isSubscribed) {
                refinedCollectionCardProps.handleUnsubscribe = handleUnsubscribe;
              } else {
                refinedCollectionCardProps.handleSubscribe = handleSubscribe;
              }
            }

            return <CollectionCard key={collection.id} collection={collection} href={href} {...refinedCollectionCardProps} />;
          })}
        </div>
      </div>
    </div>
  );
};

export default CollectionSearchList;
