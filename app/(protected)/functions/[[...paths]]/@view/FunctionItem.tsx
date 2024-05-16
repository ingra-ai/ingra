'use client';
import React from 'react';
import { PencilIcon, TrashIcon, CodeBracketSquareIcon } from '@heroicons/react/24/outline';
import { type Function } from '@prisma/client';
import formatDistance from 'date-fns/formatDistance';
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

interface FunctionProps {
  functionData: Function;
  onDryRun: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const FunctionItem: React.FC<FunctionProps> = (props) => {
  const { functionData, onDryRun, onEdit, onDelete } = props;
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
      <div className="block min-h-[100px] py-4">
        <p className="text-gray-300 text-sm">{(functionData.description || '~').slice(0, 200)}</p>
      </div>
      <div className="mt-auto flex justify-center items-center">
        <button onClick={onDryRun} aria-label='Dry Run' title='Dry Run' className="p-1 mr-2 text-amber-300 hover:text-amber-400">
          <CodeBracketSquareIcon className="h-4 w-4" />
        </button>
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
              <AlertDialogTitle>Are you sure to delete &quot;{ functionData.slug }&quot;?</AlertDialogTitle>
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
      <div className="flex justify-center items-center mt-2">
        <p className="text-xs text-gray-500">Updated: {formatDistance(functionData.updatedAt, Date.now(), { addSuffix: true })}</p>
      </div>
    </div>
  );
};

export default FunctionItem;
