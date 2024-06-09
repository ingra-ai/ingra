import React from 'react';
import { Button } from '@components/ui/button';
import { CollectionListGetPayload } from '@protected/mine/collections/types';
import { PencilIcon, EyeIcon, TrashIcon } from '@heroicons/react/24/outline';
import { SquareDashedBottomCodeIcon, RssIcon, TagIcon, MoreVertical } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from 'next/link';
import { cn } from '@lib/utils';

interface CollectionCardProps extends React.HTMLAttributes<HTMLDivElement> {
  collection: CollectionListGetPayload;
  handleEdit: () => void;
  handleView: () => void;
  handleDelete: () => void;
}

const CollectionCard: React.FC<CollectionCardProps> = (props) => {
  const { collection, handleEdit, handleView, handleDelete, ...divProps } = props;

  const functionNames = collection.functions.map((fn) => fn.slug);
  const functionNamesText = functionNames.slice(0, 2).join(', ') + (functionNames.length > 2 ? `, and +${functionNames.length - 2} more` : '');

  const allTags = new Set(...collection.functions.map((fn) => fn.tags.flatMap((tag) => tag.name)));
  const allTagsText = Array.from(allTags).slice(0, 2).join(', ') + (allTags.size > 2 ? `, and +${allTags.size - 2} more` : '');

  const classes = cn('p-4 rounded-lg bg-card border shadow-md', divProps.className);

  return (
    <div data-testid='collection-card' {...divProps} className={classes}>
      <div className="flex justify-between items-start">
        <div className="min-w-0 space-y-2">
          <Link className='block w-full leading-6' href={`/mine/collections/view/${collection.id}`}>
            <h2 className="text-lg inline-block text-info">{collection.slug}</h2>
          </Link>
          <p className="truncate text-xs">
            <RssIcon className="w-4 h-4 mr-2 inline-block" />
            {collection._count.subscribers.toLocaleString(undefined, { minimumFractionDigits: 0 })}
          </p>
          <div className="block space-y-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild className="">
                  <p className="truncate text-xs">
                    <SquareDashedBottomCodeIcon className="w-4 h-4 mr-2 inline-block" />
                    {functionNamesText || 'N/A'}
                  </p>
                </TooltipTrigger>
                <TooltipContent className='bg-card'>
                  <ul className='block space-y-2'>
                    {collection.functions.map(elem => {
                      return (
                        <li key={elem.id}>
                          <p className="truncate min-w-0">
                            <span>{elem.slug}</span>
                          </p>
                        </li>
                      );
                    })}
                  </ul>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild className="">
                  <p className="truncate text-xs">
                    <TagIcon className="w-4 h-4 mr-2 inline-block" />
                    {allTagsText || 'N/A'}
                  </p>
                </TooltipTrigger>
                <TooltipContent className='bg-card'>
                  <p className="truncate min-w-0">{[...allTags].join(', ')}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="py-3">
            <h4 className="truncate text-sm font-medium leading-6">
              {collection.name}
            </h4>
            <p className="truncate text-sm leading-6">
              {collection.description}
            </p>
          </div>
        </div>
        <div className="min-w-0 relative inline-block text-left">
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
                <button
                  type="button"
                  onClick={handleEdit}
                  className="flex items-center w-full"
                >
                  <PencilIcon className="w-4 h-4 mr-2" />
                  Edit
                </button>
              </DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-secondary hover:text-secondary-foreground cursor-pointer p-2">
                <button
                  type="button"
                  onClick={handleView}
                  className="flex items-center w-full"
                >
                  <EyeIcon className="w-4 h-4 mr-2" />
                  View
                </button>
              </DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-secondary hover:text-secondary-foreground cursor-pointer p-2">
                <button
                  type="button"
                  onClick={handleDelete}
                  className="flex items-center w-full"
                >
                  <TrashIcon className="w-4 h-4 mr-2" />
                  Delete
                </button>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};

export default CollectionCard;