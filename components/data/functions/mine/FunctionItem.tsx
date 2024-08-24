'use client';
import React from 'react';
import Link from 'next/link';
import { PlusIcon, ClockIcon } from 'lucide-react';
import type { FunctionListGetPayload } from './types';
import { Badge } from '@components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import formatDistance from 'date-fns/formatDistance';
import format from 'date-fns/format';
import { getUserRepoFunctionsNewUri } from '@lib/constants/repo';

interface FunctionItemProps {
  functionData: FunctionListGetPayload;
  href: string;
}

const FunctionItem: React.FC<React.PropsWithChildren<FunctionItemProps>> = (props) => {
  const { functionData, href, children } = props;
  const totalArguments = functionData.arguments.length;
  const subtext = [
    functionData.httpVerb,
    functionData.isPublished ? 'Published' : 'Unpublished'
  ].filter(Boolean).join(' - ');

  return (
    <div className="flex flex-col bg-secondary border border-gray-500 hover:border-gray-300 shadow-md rounded-sm px-4 py-2 w-full min-h-[200px]">
      <Link className="block space-y-2 py-2 h-full cursor-pointer" role='button' tabIndex={0} aria-pressed='false' href={href} title={functionData.description}>
        <p className="text-gray-400 text-xs">{subtext}</p>
        <h2 className="text-lg font-bold text-gray-100 truncate min-w-0" title={functionData.slug}>
          {functionData.slug}
        </h2>
        <span className="block">
          <span className={`px-2 py-1 inline-flex text-xs leading-3 font-semibold rounded-full ${functionData.isPrivate ? 'bg-red-700 text-red-200' : 'bg-green-700 text-green-200'}`}>
            {functionData.isPrivate ? 'Private' : 'Public'}
          </span>
          {functionData.tags.map(tag => (
            <Badge key={tag.id} variant="accent" className="mr-1 text-xs">{tag.name}</Badge>
          ))}
        </span>
        {
          totalArguments > 0 && (
            <span className="block">
              <p className="text-xs text-gray-400">
                {totalArguments} argument{totalArguments > 1 ? 's' : ''}
              </p>
            </span>
          )
        }
      </Link>
      <div className="grid grid-cols-12 mt-auto">
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
        </div>
      </div>
      {children}
    </div>
  );
};

interface FunctionItemNewProps {
  ownerUsername: string;
}

const FunctionItemNew: React.FC<FunctionItemNewProps> = ({ ownerUsername }) => {
  return (
    <Link
      href={getUserRepoFunctionsNewUri(ownerUsername)}
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
