'use client';
import React from 'react';
import { ClockIcon, EyeIcon } from '@heroicons/react/24/outline';
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
import { Button } from '@components/ui/button';

interface MarketplaceFunctionItemProps {
  functionData: FunctionMarketListGetPayload;
  isSubscribed: boolean;
  onFork: () => void;
  onSubscribeToggle: () => void;
  onView: () => void;
}

const MarketplaceFunctionItem: React.FC<MarketplaceFunctionItemProps> = (props) => {
  const { functionData, isSubscribed = false, onFork, onSubscribeToggle, onView } = props;
  const authorName = functionData?.owner?.profile?.userName || 'Anonymous';
  const totalArguments = functionData.arguments.length;
  return (
    <div
      className="flex flex-col bg-secondary border border-gray-500 hover:border-gray-300 shadow-md rounded-sm px-4 py-2 w-full min-h-[200px] cursor-pointer"
      title={functionData.description}
    >
      <div 
        className="block space-y-2 py-2 h-full"
        role='button'
        tabIndex={0}
        aria-pressed='false'
        onClick={onView}
      >
        <div className="flex justify-between">
          <p className="text-gray-400 text-xs">{functionData.httpVerb}</p>
          <p className="text-xs">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button aria-label='Fork' title='Fork' className="p-1">
                  <GitForkIcon className="h-5 w-5 inline-flex mr-1 text-green-300 hover:text-green-400" />
                  <span>{functionData._count.forksTo.toLocaleString(undefined, { minimumFractionDigits: 0 })}</span>
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure to fork &quot;{functionData.slug}&quot; from {authorName}?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Forking this function allows you to customize and modify it to suit your needs. However, please note that once you fork the function, you won&apos;t receive any future updates or improvements made to the original version.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={onFork}>Continue</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </p>
        </div>
        <h2 className="text-lg font-bold text-gray-100 truncate min-w-0" title={functionData.slug}>
          {functionData.slug}
        </h2>
        <div className="block">
          <span className={`px-2 py-1 inline-flex text-xs leading-3 font-semibold rounded-full bg-green-700 text-green-200`}>
            {authorName}
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
          <button onClick={onView} aria-label='View' title='View' className="p-1 mr-2">
            <EyeIcon className="h-4 w-4" />
          </button>
          {
            isSubscribed ? (
              <Button onClick={onSubscribeToggle} type='button' variant='ghost' aria-label='Unsubscribe' title='Unsubscribe' className="text-xs px-3 py-2 h-auto rounded-3xl border border-gray-500">
                <span>Unsubscribe</span>
              </Button>
            ) : (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button type='button' variant='default' aria-label='Subscribe' title='Subscribe' className="text-xs px-3 py-2 h-auto rounded-3xl">
                    <span>Subscribe</span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure to subscribe &quot;{functionData.slug}&quot; from {authorName}?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Subscribing to this function allows you to receive updates and improvements made to the original version. However, please note that you won&apos;t be able to customize or modify the function.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={onSubscribeToggle}>Continue</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )
          }
        </div>
      </div>
    </div>
  );
};

export default MarketplaceFunctionItem;
