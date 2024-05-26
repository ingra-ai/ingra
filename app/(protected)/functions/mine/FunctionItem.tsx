'use client';
import React from 'react';
import Link from 'next/link';
import { PencilIcon, TrashIcon, ClockIcon } from '@heroicons/react/24/outline';
import { PlusIcon } from 'lucide-react';
import formatDistance from 'date-fns/formatDistance';
import format from 'date-fns/format';
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import type { FunctionListGetPayload } from '@protected/functions/mine/types';
import { Badge } from '@components/ui/badge';

interface FunctionItemProps {
  functionData: FunctionListGetPayload;
  onEdit: () => void;
  onDelete: () => void;
}

const FunctionItem: React.FC<FunctionItemProps> = (props) => {
  const { functionData, onEdit, onDelete } = props;
  const totalArguments = functionData.arguments.length;
  const totalForks = functionData._count.forksTo;
  const subtext = [
    functionData.httpVerb,
    functionData.isPublished ? 'Published' : 'Unpublished',
    totalForks > 0 ? `${totalForks} fork${totalForks > 1 ? 's' : ''}` : null,
  ].filter(Boolean).join(' - ');

  return (
    <div 
      className="flex flex-col bg-secondary border border-gray-500 hover:border-gray-300 shadow-md rounded-sm px-4 py-2 w-full min-h-[200px] cursor-pointer"
      title={functionData.description}
    >
      <div className="block space-y-2 py-2 h-full"
        role='button'
        tabIndex={0}
        aria-pressed='false'
        onClick={onEdit}
      >
        <p className="text-gray-400 text-xs">{subtext}</p>
        <h2 className="text-lg font-bold text-gray-100 truncate min-w-0" title={functionData.slug}>
          {functionData.slug}
        </h2>
        <div className="block">
          <span className={`px-2 py-1 inline-flex text-xs leading-3 font-semibold rounded-full ${functionData.isPrivate ? 'bg-red-700 text-red-200' : 'bg-green-700 text-green-200'}`}>
            {functionData.isPrivate ? 'Private' : 'Public'}
          </span>
          {functionData.tags.map(tag => (
            <Badge key={tag.id} variant="accent" className="mr-1 text-xs">{tag.name}</Badge>
          ))}
        </div>
        {
          totalArguments > 0 && (
            <div className="block">
              <p className="text-xs text-gray-400">
                {totalArguments} argument{totalArguments > 1 ? 's' : ''}
              </p>
            </div>
          )
        }
      </div>
      <div className="grid grid-cols-12">
        <div className="col-span-8 flex justify-start items-center">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <p className="text-xs text-gray-500">
                  <ClockIcon className="inline h-4 w-4 mr-1" />
                  {formatDistance(functionData.updatedAt, Date.now(), { addSuffix: true })}
                </p>
              </TooltipTrigger>
              <TooltipContent>
                <p className="truncate min-w-0">Last update on {format(functionData.updatedAt, 'PPpp')} </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

        </div>
        <div className="col-span-4 flex justify-end items-center">
          <button onClick={onEdit} aria-label='Edit' title='Edit' className="p-1 mr-2 text-zinc-300 hover:text-zinc-400">
            <PencilIcon className="h-4 w-4" />
          </button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button aria-label='Delete' title='Delete' className="p-1 text-red-300 hover:text-red-400">
                <TrashIcon className="h-4 w-4" />
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure to delete &quot;{functionData.slug}&quot;?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete your function.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={onDelete}>Continue</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
};

interface FunctionItemNewProps {
}

const FunctionItemNew: React.FC<FunctionItemNewProps> = (props) => {
  return (
    <Link
      href="/functions/new"
      className="flex flex-col justify-center items-center text-gray-500 hover:text-gray-300 border border-gray-500 hover:border-gray-300 shadow-md rounded-sm p-4 w-full min-h-[200px]">
      <PlusIcon className="h-12 w-12" />
      New Function
    </Link>
  );
};

export {
  FunctionItem,
  FunctionItemNew
};
