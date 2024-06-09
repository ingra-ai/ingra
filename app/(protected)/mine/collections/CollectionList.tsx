'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@components/ui/use-toast';
import { deleteCollection } from '@protected/mine/collections/actions/collections';
import type { CollectionListGetPayload } from '@protected/mine/collections/types';
import { PlusIcon } from '@heroicons/react/24/outline';
import { FormSlideOver } from '@components/slideovers/FormSlideOver';
import { CollectionForm } from '@protected/mine/collections/CollectionForm';
import { Button } from '@components/ui/button';
import CollectionCard from './CollectionCard';
import { cn } from '@lib/utils';

interface CollectionListProps extends React.HTMLAttributes<HTMLDivElement> {
  collections: CollectionListGetPayload[];
}

const CollectionList: React.FC<CollectionListProps> = ({ collections, ...divProps }) => {
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = React.useState(false);
  const [editCollection, setEditCollection] = React.useState<CollectionListGetPayload | undefined>(undefined);

  const handleEdit = (collection: CollectionListGetPayload) => {
    setEditCollection(collection);
    setOpen(true);
  };

  const handleCancel = () => {
    setEditCollection(undefined);
    setOpen(false);
  }

  const handleView = (collection: CollectionListGetPayload) => {
    router.push(`/mine/collections/view/${collection.id}`);
  };

  const handleDelete = (collection: CollectionListGetPayload) => {
    // Prompt user
    const confirmed = confirm(`Are you sure to delete this collection? Removing this will just remove the collection and your functions will only be disconnected from it.`);

    if (confirmed) {
      deleteCollection(collection.id).then((result) => {
        if (result.status !== 'ok') {
          throw new Error(result.message);
        }
  
        toast({
          title: 'Success!',
          description: 'Collection has been deleted successfully.',
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
    <div data-testid='collection-list' { ...divProps } className={ classes }>
      <div className="mx-auto space-y-6">
        <div className={collectionListGridClasses}>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(true)}
            className="flex flex-col justify-center items-center text-gray-500 hover:text-gray-300 border border-gray-500 hover:border-gray-300 shadow-md rounded-sm p-4 w-full min-h-[200px]">
            <PlusIcon className="h-12 w-12" />
            New Collection
          </Button>
          {collections.map((collection) => (
            <CollectionCard 
              key={collection.id}
              collection={collection}
              handleView={() => handleView( collection )}
              handleEdit={() => handleEdit( collection )}
              handleDelete={() => handleDelete( collection )}
            />
          ))}
        </div>
      </div>
      <FormSlideOver title={ editCollection ? `Edit collection '${ editCollection.name}'` : 'Add new collection' } open={open} setOpen={setOpen}>
        <CollectionForm collectionRecord={ editCollection } onCancel={ handleCancel } />
      </FormSlideOver>
    </div>
  );
};

export default CollectionList;
