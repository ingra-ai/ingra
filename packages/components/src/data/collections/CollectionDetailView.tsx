'use client';
import { useCallback, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { PencilIcon } from '@heroicons/react/24/outline';
import { FolderIcon, FileJsonIcon, MoreVertical, TrashIcon } from 'lucide-react';
import { deleteCollection } from '@repo/shared/actions/collections';
import { getUserApiCollectionsOpenApiJsonUri, getUserApiCollectionsSwaggerUri, getUserRepoCollectionsUri } from '@repo/shared/lib/constants/repo';
import { FormSlideOver } from '@repo/components/slideovers/FormSlideOver';
import { Button } from '@repo/components/ui/button';
import { useToast } from '@repo/components/ui/use-toast';
import { CollectionForm } from './mine/CollectionForm';
import { CollectionDetailViewPayload } from './types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@repo/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@repo/components/ui/dropdown-menu';
import { AuthSessionResponse } from '@repo/shared/data/auth/session/types';
import Link from 'next/link';
import { Avatar, AvatarFallback } from '@repo/components/ui/avatar';
import { formatDistance } from 'date-fns/formatDistance';
import { CreateNewFunctionButton } from '@repo/components/data/functions';
import { cn } from '@repo/shared/lib/utils';

interface CollectionDetailViewsProps {
  authSession?: AuthSessionResponse | null;
  record: CollectionDetailViewPayload;
}

export const CollectionDetailView: React.FC<CollectionDetailViewsProps> = ({ authSession, record }) => {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const ownerUsername = record?.owner?.profile?.userName || '';
  const isOwner = authSession?.user?.profile?.userName && ownerUsername && authSession?.user?.profile?.userName === ownerUsername;
  const isSubscribed = ( record?.subscribers || [] ).some((subscriber) => subscriber.id === authSession?.user?.id);

  const openApiJsonUrl = getUserApiCollectionsOpenApiJsonUri(ownerUsername, record.slug);
  const swaggerApiUrl = getUserApiCollectionsSwaggerUri(ownerUsername, record.slug);
  const isNotOwnerOrSubscriber = !isOwner || !isSubscribed;

  const handleDelete = useCallback(() => {
    const confirmed = confirm(`Are you sure you want to delete this collection? This will only remove the collection; your functions will be disconnected from it.`);

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
  }, [record, toast, router, ownerUsername]);

  return (
    <Card className="w-full" data-testid="collection-view-details">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <FolderIcon className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="text-xl">{record.name}</CardTitle>
              <CardDescription>{record.slug}</CardDescription>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            {
              isOwner && (
                <CreateNewFunctionButton authSession={authSession} ownerUsername={ownerUsername} collectionSlug={record?.slug} />
              )
            }
            <Button 
              asChild 
              type="button" 
              aria-label="OpenAPI JSON" 
              title={!isNotOwnerOrSubscriber ? "OpenAPI JSON" : "OpenAPI JSON is not available for a collection you are not subscribed to."} 
              className={cn({ 
                'cursor-not-allowed': isNotOwnerOrSubscriber
              })}
              variant="outline" 
              size="icon" 
              disabled={isNotOwnerOrSubscriber}
            >
              {
                isNotOwnerOrSubscriber ? (
                  <div>
                    <span className="sr-only">OpenAPI JSON is not available for a collection you are not subscribed to.</span>
                    <FileJsonIcon className="h-4 w-4" aria-hidden="true" />
                  </div>
                ) : (
                  <Link href={openApiJsonUrl} target="_blank" prefetch={false}>
                    <FileJsonIcon className="h-4 w-4" aria-hidden="true" />
                  </Link>
                )
              }
            </Button>
            {isOwner && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <span className="sr-only">Open menu</span>
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setOpen(true)}>
                    <PencilIcon className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDelete} className="text-destructive cursor-pointer dark:hover:bg-gray-700 hover:bg-gray-300">
                    <TrashIcon className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div>
            <h3 className="text-lg font-semibold mb-2">Owner</h3>
            <div className="flex items-center space-x-4">
              <Avatar>
                <AvatarFallback>{ownerUsername.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{ownerUsername}</p>
                {
                  isOwner ? (
                    <p className="text-sm text-primary">You</p>
                  ) : (
                    <p className="text-sm text-muted-foreground">Contributor</p>
                  )
                }
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Details</h3>
            <div className="space-y-2">
              <p>
                <span className="font-medium mr-2">Swagger: </span>
                {
                  isNotOwnerOrSubscriber ? (
                    <span 
                      className="text-muted-foreground cursor-not-allowed"
                      title="Swagger is not available for a collection you are not subscribed to."
                    >
                      {swaggerApiUrl}
                    </span>
                  ) : (
                    <Link href={swaggerApiUrl} prefetch={false} target="_blank" className="text-primary hover:underline">{swaggerApiUrl}</Link>
                  )
                }
              </p>
              <p>
                <span className="font-medium mr-2">Last Updated: </span> 
                {formatDistance(record.updatedAt, Date.now(), {
                  addSuffix: true,
                })}
              </p>
            </div>
          </div>
        </div>
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Description</h3>
          <div className="prose max-w-none text-gray-600 dark:text-gray-400" dangerouslySetInnerHTML={{ __html: record.description || 'No description provided.' }} />
        </div>
      </CardContent>
      {isOwner && (
        <FormSlideOver title={`Edit collection '${record.name}'`} open={open} setOpen={setOpen}>
          <CollectionForm collectionRecord={record} onCancel={() => setOpen(false)} />
        </FormSlideOver>
      )}
    </Card>
  );
};