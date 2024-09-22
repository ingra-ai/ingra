'use client';
import React, { useCallback, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { PencilIcon } from '@heroicons/react/24/outline';
import { MoreVertical, TrashIcon } from 'lucide-react';
import { deleteCollection } from '@repo/shared/actions/collections';
import { getUserApiCollectionsOpenApiJsonUri, getUserRepoCollectionsUri } from '@repo/shared/lib/constants/repo';
import { FormSlideOver } from '../../../slideovers/FormSlideOver';
import { Button } from '../../../ui/button';
import { useToast } from '../../../ui/use-toast';
import { CollectionForm } from '../../../data/collections/mine/CollectionForm';
import { MineCollectionViewDetailPayload } from '../../../data/collections/mine/types';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../../../ui/dropdown-menu';

interface CollectionViewDetailsProps {
  ownerUsername: string;
  record: MineCollectionViewDetailPayload;
}

const CollectionViewDetails: React.FC<CollectionViewDetailsProps> = ({ ownerUsername, record }) => {
  const [open, setOpen] = React.useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const openApiJsonUrl = getUserApiCollectionsOpenApiJsonUri(ownerUsername, record.slug);

  const handleDelete = useCallback(() => {
    // Prompt user
    const confirmed = confirm(`Are you sure to delete this collection? Removing this will just remove the collection and your functions will only be disconnected from it.`);

    if (confirmed) {
      deleteCollection(record.id)
        .then((result) => {
          if (result.status !== 'ok') {
            throw new Error(result.message);
          }

          toast({
            title: 'Success!',
            description: result.message || 'Collection has been deleted successfully.',
          });

          startTransition(() => {
            router.replace(getUserRepoCollectionsUri(ownerUsername));
          });
        })
        .catch((error) => {
          toast({
            variant: 'destructive',
            title: 'Uh oh! Something went wrong.',
            description: error?.message || 'Failed to delete collection!',
          });
        });
    }
  }, [record]);

  return (
    <div className="block" data-testid="collection-view-details">
      <div className="flex justify-between items-center">
        <div className="flex-1">
          <h2 className="text-2xl font-semibold inline">{record.name}</h2>
        </div>
        <div className="flex-0 px-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0 border rounded-lg">
                <span className="sr-only">Open menu</span>
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-card">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="hover:bg-secondary hover:text-secondary-foreground cursor-pointer p-2">
                <button type="button" onClick={() => setOpen(true)} className="flex items-center w-full">
                  <PencilIcon className="w-4 h-4 mr-2" />
                  Edit
                </button>
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive hover:bg-secondary hover:text-secondary-foreground cursor-pointer p-2">
                <button type="button" onClick={handleDelete} className="flex items-center w-full">
                  <TrashIcon className="w-4 h-4 mr-2" />
                  Delete
                </button>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="flex flex-col text-sm text-gray-300 mb-6 gap-2">
        <p className="">
          <span className="font-medium">Slug: </span>
          <code className="ml-2">{record.slug}</code>
        </p>
        <p className="">
          <span className="font-medium">OpenAPI: </span>
          <a href={openApiJsonUrl} target="_blank">
            <span className="text-info">openapi.json</span>
          </a>
        </p>
      </div>
      <div className="mt-2">
        <h3 className="text-sm font-semibold leading-6">Description</h3>
        <div className="py-2 rounded-sm min-h-[50vh] text-sm whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: record.description || '' }} />
      </div>
      <FormSlideOver title={`Edit collection '${record.name}'`} open={open} setOpen={setOpen}>
        <CollectionForm collectionRecord={record} onCancel={() => setOpen(false)} />
      </FormSlideOver>
    </div>
  );
};

export default CollectionViewDetails;
