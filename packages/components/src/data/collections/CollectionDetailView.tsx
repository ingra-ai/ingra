'use client';
import React, { useCallback, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { PencilIcon } from '@heroicons/react/24/outline';
import { FileJsonIcon, FolderIcon, MoreVertical, TrashIcon } from 'lucide-react';
import { deleteCollection } from '@repo/shared/actions/collections';
import { getUserApiCollectionsOpenApiJsonUri, getUserApiCollectionsSwaggerUri, getUserRepoCollectionsUri } from '@repo/shared/lib/constants/repo';
import { FormSlideOver } from '@repo/components/slideovers/FormSlideOver';
import { Button } from '@repo/components/ui/button';
import { useToast } from '@repo/components/ui/use-toast';
import { CollectionForm } from './mine/CollectionForm';
import { CollectionDetailViewPayload } from './types';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@repo/components/ui/dropdown-menu';
import { AuthSessionResponse } from '@repo/shared/data/auth/session/types';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '../../ui/avatar';

interface CollectionDetailViewsProps {
  authSession?: AuthSessionResponse | null;
  record: CollectionDetailViewPayload;
}

export const CollectionDetailView: React.FC<CollectionDetailViewsProps> = ({ authSession, record }) => {
  const [open, setOpen] = React.useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const ownerUsername = record?.owner?.profile?.userName || '';
  const isOwner = authSession?.user?.profile?.userName && authSession?.user?.profile?.userName === ownerUsername;
  const openApiJsonUrl = getUserApiCollectionsOpenApiJsonUri(ownerUsername, record.slug);
  const swaggerApiUrl = getUserApiCollectionsSwaggerUri(ownerUsername, record.slug);

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
        <div className="flex-1 flex items-center">
          <FolderIcon className="h-6 w-6 mr-4" />
          <h2 className="text-2xl font-semibold inline">{record.name}</h2>
        </div>
        <div className="flex-0 px-4 flex space-x-4">
          <Button asChild type="button" aria-label="OpenAPI JSON" title="OpenAPI JSON" variant="ghost" size="sm" className="p-0">
            <Link className="" href={openApiJsonUrl} target="_blank" prefetch={false}>
              <FileJsonIcon className="h-5 w-5" aria-hidden="true" />
            </Link>
          </Button>
          {
            isOwner && (
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
            )
          }
        </div>
      </div>
      <div className="flex flex-col text-sm mb-6 mt-4 gap-2 space-y-2">
        <div className="flex items-center space-x-4">
          <Avatar className="h-10 w-10">
            <AvatarFallback>{ownerUsername.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">{ownerUsername}</p>
            <p className="text-sm text-muted-foreground">Owner</p>
          </div>
        </div>
      </div>
      <div className="mt-3 space-y-2">
        <div className="flex leading-6">
          <h4 className="text-sm font-semibold">
            Slug:
          </h4>
          <p className="text-sm ml-4 font-medium">{record.slug}</p>
        </div>
        <div className="flex leading-6">
          <h4 className="text-sm font-semibold">
            Swagger:
          </h4>
          <a href={swaggerApiUrl} target="_blank" className="text-sm ml-4 font-medium">{swaggerApiUrl}</a>
        </div>
        <div className="">
          <h4 className="text-sm font-semibold leading-6">Description</h4>
          <div className="py-2 rounded-sm text-sm" dangerouslySetInnerHTML={{ __html: record.description || '' }} />
        </div>
      </div>
      {
        isOwner && (
          <FormSlideOver title={`Edit collection '${record.name}'`} open={open} setOpen={setOpen}>
            <CollectionForm collectionRecord={record} onCancel={() => setOpen(false)} />
          </FormSlideOver>
        )
      }
    </div>
  );
};

