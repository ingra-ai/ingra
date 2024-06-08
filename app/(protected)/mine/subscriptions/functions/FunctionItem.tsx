'use client';
import React from 'react';
import { EyeIcon, TrashIcon, ClockIcon } from '@heroicons/react/24/outline';
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
import type { FunctionSubscriptionListGetPayload } from '@protected/mine/subscriptions/functions/types';
import { Badge } from '@components/ui/badge';

interface FunctionItemProps {
  functionSubscriptionData: FunctionSubscriptionListGetPayload;
  onView: () => void;
  onUnsubscribe: () => void;
}

export const FunctionItem: React.FC<FunctionItemProps> = (props) => {
  const { functionSubscriptionData: { function: functionData }, onView, onUnsubscribe } = props;
  const subtext = [
    functionData.httpVerb
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
        onClick={onView}
      >
        <p className="text-gray-400 text-xs">{subtext}</p>
        <h2 className="text-lg font-bold text-gray-100 truncate min-w-0" title={functionData.slug}>
          {functionData.slug}
        </h2>
        <div className="block">
          <span className={`px-2 py-1 inline-flex text-xs leading-3 font-semibold rounded-full bg-green-700 text-green-200`}>
            {functionData.owner.profile?.userName || 'anonymous'}
          </span>
          {functionData.tags.map(tag => (
            <Badge key={tag.id} variant="accent" className="mr-1 text-xs">{tag.name}</Badge>
          ))}
        </div>
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
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button aria-label='Unsubscribe' title='Unsubscribe' className="p-1 text-red-300 hover:text-red-400">
                <TrashIcon className="h-4 w-4" />
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure to unsubscribe to &quot;{functionData.slug}&quot;?</AlertDialogTitle>
                <AlertDialogDescription>
                  You can always subscribe again later
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={onUnsubscribe}>Continue</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
};

