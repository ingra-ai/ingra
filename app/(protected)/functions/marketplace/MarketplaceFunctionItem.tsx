'use client';
import React from 'react';
import { ClockIcon } from '@heroicons/react/24/outline';
import { GitForkIcon } from 'lucide-react';
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
import { FunctionMarketListGetPayload } from './types';
import { Badge } from '@components/ui/badge';

interface MarketplaceFunctionItemProps {
  functionData: FunctionMarketListGetPayload;
  onFork: () => void;
}

const MarketplaceFunctionItem: React.FC<MarketplaceFunctionItemProps> = (props) => {
  const { functionData, onFork } = props;
  const authorName = functionData?.owner?.profile?.userName || 'Anonymous';
  const totalArguments = functionData.arguments.length;
  return (
    <div 
      className="flex flex-col bg-secondary border border-gray-500 hover:border-gray-300 shadow-md rounded-sm px-4 py-2 w-full min-h-[200px] cursor-pointer"
      title={functionData.description}
    >
      <div className="block space-y-2 py-2 h-full">
        <div className="flex justify-between">
          <p className="text-gray-400 text-xs">{functionData.httpVerb}</p>
          <p className="text-xs">
            <GitForkIcon className="h-4 w-4 inline-flex mr-1" />
            { functionData._count.forksTo }
          </p>
        </div>
        <h2 className="text-lg font-bold text-gray-100 truncate min-w-0" title={functionData.slug}>
          {functionData.slug}
        </h2>
        <div className="block">
          <span className={`px-2 py-1 inline-flex text-xs leading-3 font-semibold rounded-full bg-green-700 text-green-200`}>
            { authorName }
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
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button aria-label='Fork' title='Fork' className="p-1 text-green-300 hover:text-green-400">
                <GitForkIcon className="h-5 w-5" />
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure to fork &quot;{functionData.slug}&quot; from { authorName }?</AlertDialogTitle>
                <AlertDialogDescription>
                  You will be redirected to edit function once the fork is successful.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={onFork}>Continue</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
};

export default MarketplaceFunctionItem;
