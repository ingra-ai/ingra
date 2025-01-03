import React from 'react';
import Link from 'next/link';
import { FileJsonIcon, RssIcon, TagIcon, RefreshCcw, MoreVertical } from 'lucide-react';
import { cn } from '@repo/shared/lib/utils';
import type { CollectionCardPayload } from './types';
import { Button } from '@repo/components/ui/button';
import { Badge } from '@repo/components/ui/badge';
import { EyeIcon, FolderIcon, TrashIcon } from '@heroicons/react/24/outline';
import { getUserApiCollectionsOpenApiJsonUri } from '@repo/shared/lib/constants/repo';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@repo/components/ui/dropdown-menu';
import { AuthSessionResponse } from '@repo/shared/data/auth/session/types';

interface CollectionCardProps extends React.HTMLAttributes<HTMLDivElement> {
  authSession?: AuthSessionResponse | null;
  collection: CollectionCardPayload;
  href: string;
  handleSubscribe?: (collection: CollectionCardPayload) => Promise<void>;
  handleUnsubscribe?: (collection: CollectionCardPayload) => Promise<void>;
  handleDelete?: (collection: CollectionCardPayload) => Promise<void>;
}

export const CollectionCard: React.FC<React.PropsWithChildren<CollectionCardProps>> = (props) => {
  const { authSession, collection, href, children, handleDelete: onHandleDelete, handleSubscribe: onHandleSubscribe, handleUnsubscribe: onHandleUnsubscribe, ...divProps } = props;

  const isOwner = authSession?.user?.profile?.userName && collection.owner?.profile?.userName && authSession?.user?.profile?.userName === collection.owner?.profile?.userName;

  // The fetched record of subscribers should already only fetch subscribers of current user.
  const isSubscribed = ( collection?.subscribers || [] ).length > 0;

  const [cardState, setCardState] = React.useState({
    isSubscribing: false,
    isDeleting: false,
  });

  const handleSubscribe = async (collection: CollectionCardPayload) => {
    if (typeof onHandleSubscribe !== 'function') {
      return null;
    }

    setCardState({ ...cardState, isSubscribing: true });

    return onHandleSubscribe(collection).finally(() => {
      setCardState({ ...cardState, isSubscribing: false });
    });
  };

  const handleUnsubscribe = async (collection: CollectionCardPayload) => {
    if (typeof onHandleUnsubscribe !== 'function') {
      return null;
    }

    setCardState({ ...cardState, isSubscribing: true });

    return onHandleUnsubscribe(collection).finally(() => {
      setCardState({ ...cardState, isSubscribing: false });
    });
  };

  const handleDelete = async (collection: CollectionCardPayload) => {
    if (typeof onHandleDelete !== 'function') {
      return null;
    }

    setCardState({ ...cardState, isDeleting: true });

    return onHandleDelete(collection).finally(() => {
      setCardState({ ...cardState, isDeleting: false });
    });
  };

  // const functionNames = collection.functions.map((fn) => fn.slug);
  // const functionNamesText = functionNames.slice(0, 2).join(', ') + (functionNames.length > 2 ? `, and +${functionNames.length - 2} more` : '');

  const allTags = new Set(...collection.functions.map((fn) => fn.tags.flatMap((tag) => tag.name)));
  // const allTagsText = Array.from(allTags).slice(0, 2).join(', ') + (allTags.size > 2 ? `, and +${allTags.size - 2} more` : '');

  const ownerUsername = collection.owner?.profile?.userName || '';

  const classes = cn('bg-card shadow-md overflow-hidden shadow rounded-lg flex flex-col', divProps.className),
    canSubscribe = typeof onHandleSubscribe === 'function',
    canUnsubscribe = typeof onHandleUnsubscribe === 'function',
    canDelete = ( isOwner ) && typeof onHandleDelete === 'function',
    openApiJsonUrl = ( ownerUsername && canUnsubscribe ) ? getUserApiCollectionsOpenApiJsonUri(ownerUsername || '', collection.slug) : '';

  return (
    <div data-testid="collection-card" {...divProps} className={classes}>
      <div className="p-5 flex-grow">
        <div className="flex items-center justify-between">
          <div className="flex items-center mr-auto">
            <FolderIcon className="h-6 w-6" />
            <Link className="block w-full leading-6" href={href}>
              <h3 className="ml-2 text-lg font-medium">{collection.name}</h3>
            </Link>
          </div>
          <div className="flex items-center text-sm">
            {
              openApiJsonUrl && (
                <Button asChild type="button" aria-label="OpenAPI JSON" title="OpenAPI JSON" variant="" size="icon" className="">
                  <Link className="" href={openApiJsonUrl} target="_blank" prefetch={false}>
                    <FileJsonIcon className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </Button>
              )
            }
            {(canDelete) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="" size="icon" className="">
                    <span className="sr-only">Open menu</span>
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleDelete(collection)} className="text-destructive cursor-pointer dark:hover:bg-gray-700 hover:bg-gray-300">
                    <TrashIcon className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
        <Link className="" href={href}>
          <p className="mt-1 text-sm line-clamp-3">{collection.description}</p>
        </Link>
        <div className="mt-4 flex flex-wrap gap-2">
          {Array.from(allTags).map((tag, idx) => {
            return (
              <Badge key={idx} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" variant="indigo">
                <TagIcon className="w-4 h-4 mr-2 inline-block" />
                {tag}
              </Badge>
            );
          })}
        </div>
      </div>
      <div className="bg-gray-100 dark:bg-gray-900 px-5 py-3 flex items-center justify-between">
        <div className="text-sm font-medium text-indigo-900 dark:text-indigo-100">{collection._count.subscribers.toLocaleString(undefined, { minimumFractionDigits: 0 })} subscribers</div>
        <div className="flex items-center space-x-2">
          <Button asChild type="button" aria-label="View" title="View" variant="indigo" size="sm" className="p-2 w-8 h-8 border-transparent rounded-full shadow-sm">
            <Link className="" href={href}>
              <EyeIcon className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
          {canSubscribe && (
            <Button
              type="button"
              aria-label="Subscribe"
              title="Subscribe"
              variant="indigo"
              size="sm"
              disabled={cardState.isSubscribing}
              className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md"
              onClick={() => handleSubscribe(collection)}
            >
              {cardState.isSubscribing ? <RefreshCcw className="w-4 h-4 animate-spin inline-block mr-2" /> : <RssIcon className="w-4 h-4 inline-block mr-2" />}
              Subscribe
            </Button>
          )}
          {canUnsubscribe && (
            <Button
              type="button"
              aria-label="Unsubscribe"
              title="Unsubscribe"
              variant="destructive"
              size="sm"
              disabled={cardState.isSubscribing}
              className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md"
              onClick={() => handleUnsubscribe(collection)}
            >
              {cardState.isSubscribing && <RefreshCcw className="w-4 h-4 animate-spin inline-block mr-2" />}
              Unsubscribe
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CollectionCard;
