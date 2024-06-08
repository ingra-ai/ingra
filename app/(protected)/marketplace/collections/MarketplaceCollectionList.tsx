'use client';
import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { CollectionMarketplaceListGetPayload, CollectionSubscriptionMarketplaceListGetPayload } from '@protected/marketplace/collections/types';
import MarketplaceCollectionCard from './MarketplaceCollectionCard';
import { cn } from '@lib/utils';
import { useToast } from '@components/ui/use-toast';
import { subscribeToggleFunction } from '@protected/mine/collections/actions/collections';
import { Button } from '@components/ui/button';
import { RefreshCcw, RssIcon } from 'lucide-react';
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
} from "@/components/ui/alert-dialog"

interface MarketplaceCollectionListProps extends React.HTMLAttributes<HTMLDivElement> {
  collections: CollectionMarketplaceListGetPayload[];
  subscribedCollections: CollectionSubscriptionMarketplaceListGetPayload[];
}

const MarketplaceCollectionList: React.FC<MarketplaceCollectionListProps> = ({ collections, subscribedCollections, ...divProps }) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isSubscribeLoading, setIsSubscribeLoading] = useState<false | string>(false);
  const { toast } = useToast();

  const handleSubscribeToggle = async (collectionId: string) => {
    setIsSubscribeLoading(collectionId);
    return subscribeToggleFunction(collectionId).then((result) => {
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
        description: error?.message || 'Failed to handle collection!',
      });
    }).finally(() => {
      setIsSubscribeLoading(false);
    });
  };

  const classes = cn('p-6 min-h-screen', divProps.className),
    gridClasses = cn({
      'grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3': true
    });

  return (
    <div data-testid='collection-list' {...divProps} className={classes}>
      <div className={gridClasses}>
        {collections.map((collection) => {
          const isSubscribed = subscribedCollections.some(subscribedCollection => subscribedCollection.collectionId === collection.id),
            isSubscribing = isSubscribeLoading === collection.id;

          return (
            <MarketplaceCollectionCard
              key={collection.id}
              collection={collection}
              href={`/marketplace/collections/view/${collection.id}`}
            >
              <div className="flex items-center justify-center mt-4 bg-card px-3 py-2">
                <div className="w-full"></div>
                {
                  isSubscribed ? (
                    <Button onClick={() => handleSubscribeToggle(collection.id)} disabled={isSubscribing} type='button' variant='outline' aria-label='Unsubscribe' title='Unsubscribe' className="text-xs px-3 py-2 h-auto rounded-3xl text-destructive">
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
                          <AlertDialogAction onClick={() => handleSubscribeToggle(collection.id)} disabled={isSubscribing}>Continue</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )
                }
              </div>
            </MarketplaceCollectionCard>
          );
        })}
      </div>
    </div>
  );
};

export default MarketplaceCollectionList;
