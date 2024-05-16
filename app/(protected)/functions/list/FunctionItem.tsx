'use client';
import React from 'react';
import { PencilIcon, TrashIcon, ClockIcon } from '@heroicons/react/24/outline';
import { PlusIcon } from 'lucide-react';
import { type Function } from '@prisma/client';
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
import Link from 'next/link';

interface FunctionItemProps {
  functionData: Pick<Function, 'slug' | 'description' | 'isPrivate' | 'updatedAt'>;
  onEdit: () => void;
  onDelete: () => void;
}

const FunctionItem: React.FC<FunctionItemProps> = (props) => {
  const { functionData, onEdit, onDelete } = props;
  return (
    <div className="bg-gray-800 text-white border border-gray-500 hover:border-gray-300 shadow-md rounded-sm p-4 w-full min-h-[200px]">
      <div className="flex justify-between items-center py-2">
        <h2 className="text-xl font-bold text-gray-100">{functionData.slug}</h2>
      </div>
      <div className="block">
        <span className={`px-2 py-1 inline-flex text-xs leading-3 font-semibold rounded-full ${functionData.isPrivate ? 'bg-red-700 text-red-200' : 'bg-green-700 text-green-200'}`}>
          {functionData.isPrivate ? 'Private' : 'Public'}
        </span>
      </div>
      <div className="block min-h-[175px] py-4">
        <p className="text-gray-300 text-sm font-medium">{(functionData.description || '~').slice(0, 200)}</p>
      </div>
      <div className="mt-auto grid grid-cols-12">
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
                <p>Last update on { format(functionData.updatedAt, 'PPpp') } </p>
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
