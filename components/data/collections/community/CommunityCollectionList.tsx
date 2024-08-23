'use client';
import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@components/ui/use-toast';
import { unsubscribeToCollection, subscribeToCollection } from '@actions/collections';
import { RefreshCcw, RssIcon } from 'lucide-react';
import { cn } from '@lib/utils';
import { Button } from '@components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { CommunityCollectionListGetPayload } from '@components/data/collections/community/types';
import CommunityCollectionCard from './CommunityCollectionCard';
import { getUserRepoCollectionsViewUri } from '@lib/constants/repo';

interface CommunityCollectionListProps extends React.HTMLAttributes<HTMLDivElement> {
  showControls: boolean;
  collections: CommunityCollectionListGetPayload[];
}

const CommunityCollectionList: React.FC<CommunityCollectionListProps> = (props) => {
  const {
    showControls = false,
    collections,
    ...divProps
  } = props;
  const router = useRouter();
  const [isSubscribeLoading, setIsSubscribeLoading] = useState<false | string>(false);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleSubscribe = async (collection: CommunityCollectionListGetPayload) => {
    setIsSubscribeLoading(collection.id);

    return subscribeToCollection(collection.id).then((result) => {
      if (result.status !== 'ok') {
        throw new Error(result.message);
      }

      toast({
        title: 'Success!',
        description: result?.message || 'Collection has been subscribed successfully.'
      });

      startTransition(router.refresh);
    }).catch((error) => {
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: error?.message || 'Failed to subscribe',
      });
    }).finally(() => {
      setIsSubscribeLoading(false);
    });
  };

  const handleUnsubscribe = (collection: CommunityCollectionListGetPayload) => {
    // Prompt user
    const confirmed = confirm(`Are you sure to unsubscribe to this collection? Unsubscribing will remove all the functions in it accessible from you.`);

    if (confirmed) {
      setIsSubscribeLoading(collection.id);
      
      return unsubscribeToCollection(collection.id).then((result) => {
        if (result.status !== 'ok') {
          throw new Error(result.message);
        }

        toast({
          title: 'Success!',
          description: result.message || 'Collection has been unsubscribed.',
        });

        startTransition(router.refresh);
      }).catch((error) => {
        toast({
          variant: 'destructive',
          title: 'Uh oh! Something went wrong.',
          description: error?.message || 'Failed to unsubscribe.',
        });
      }).finally(() => {
        setIsSubscribeLoading(false);
      });
    }
  };

  const classes = cn('p-6 min-h-screen', divProps.className),
    collectionListGridClasses = cn({
      'grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3': true
    });

  return (
    <div data-testid='community-collection-list' {...divProps} className={classes}>
      <div className="mx-auto space-y-6">
        <div className={collectionListGridClasses}>
          {collections.map((collection) => {
            const isSubscribing = isSubscribeLoading === collection.id,
              href = getUserRepoCollectionsViewUri(collection.owner.profile?.userName || '', collection.id);

            return (
              <CommunityCollectionCard
                key={collection.id}
                collection={collection}
                href={href}
              >
                {
                  showControls && (
                    <div className="flex items-center justify-center mt-4 bg-card px-3 py-2">
                      <div className="w-full"></div>
                      {
                        collection.isSubscribed ? (
                          <Button onClick={() => handleUnsubscribe(collection)} disabled={isSubscribing} type='button' variant='outline' aria-label='Unsubscribe' title='Unsubscribe' className="text-xs px-3 py-2 h-auto rounded-3xl text-destructive">
                            {isSubscribing && <RefreshCcw className="w-4 h-4 animate-spin inline-block mr-2" />}
                            <span>Unsubscribe</span>
                          </Button>
                        ) : (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button type='button' disabled={isSubscribing} variant='outline' aria-label='Subscribe' title='Subscribe' className="text-xs px-3 py-2 h-auto rounded-3xl">
                                {
                                  isSubscribing ?
                                    <RefreshCcw className="w-4 h-4 animate-spin inline-block mr-2" /> :
                                    <RssIcon className="w-4 h-4 inline-block mr-2" />
                                }
                                <span>Subscribe</span>
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure to subscribe &quot;{collection.slug}&quot; from {collection.owner.profile?.userName}?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Subscribing to this collection allows you to subscribe to all of its own functions as well. However, please note that you won&apos;t be able to customize or modify the functions in it.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleSubscribe(collection)} disabled={isSubscribing}>Continue</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )
                      }
                    </div>
                  )
                }
              </CommunityCollectionCard>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CommunityCollectionList;
