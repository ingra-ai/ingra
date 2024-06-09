'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@components/ui/use-toast';
import { unsubscribeToCollection } from '@protected/mine/collections/actions/collections';
import type { CollectionSubscriptionGetPayload } from '@protected/subscriptions/collections/types';
import CollectionCard from './CollectionCard';
import { cn } from '@lib/utils';
import { Button } from '@components/ui/button';
import { EyeIcon, TrashIcon } from '@heroicons/react/24/outline';
import { MoreVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface CollectionListProps extends React.HTMLAttributes<HTMLDivElement> {
  collections: CollectionSubscriptionGetPayload[];
}

const CollectionList: React.FC<CollectionListProps> = ({ collections, ...divProps }) => {
  const router = useRouter();
  const { toast } = useToast();

  const handleView = (collection: CollectionSubscriptionGetPayload) => {
    router.push(`/marketplace/collections/view/${collection.id}`);
  };

  const handleUnsubscribe = (collection: CollectionSubscriptionGetPayload) => {
    // Prompt user
    const confirmed = confirm(`Are you sure to unsubscribe to this collection? Unsubscribing will remove all the functions in it accessible from you.`);

    if (confirmed) {
      unsubscribeToCollection(collection.id).then((result) => {
        if (result.status !== 'ok') {
          throw new Error(result.message);
        }

        toast({
          title: 'Success!',
          description: result.message || 'Collection has been unsubscribed.',
        });

        router.refresh();
      }).catch((error) => {
        toast({
          variant: 'destructive',
          title: 'Uh oh! Something went wrong.',
          description: error?.message || 'Failed to delete collection!',
        });
      });
    }
  };

  const classes = cn('p-6 min-h-screen', divProps.className),
    collectionListGridClasses = cn({
      'grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3': true
    });

  return (
    <div data-testid='collection-list' {...divProps} className={classes}>
      <div className="mx-auto space-y-6">
        <div className={collectionListGridClasses}>
          {collections.map((collection) => {
            return (
              <CollectionCard
                key={collection.id}
                collection={collection}
                href={`/marketplace/collections/view/${collection.id}`}
              >
                <div className="flex items-center justify-center mt-4 bg-card px-3 py-2">
                  <div className="w-full"></div>
                  <Button onClick={() => handleUnsubscribe(collection)} type='button' variant='outline' aria-label='Unsubscribe' title='Unsubscribe' className="text-xs px-3 py-2 h-auto rounded-3xl text-destructive">
                    <span>Unsubscribe</span>
                  </Button>
                </div>
              </CollectionCard>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CollectionList;
