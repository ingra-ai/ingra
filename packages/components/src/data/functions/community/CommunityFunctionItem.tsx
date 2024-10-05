'use client';
import React from 'react';
import { ClockIcon } from '@heroicons/react/24/outline';
import { formatDistance } from 'date-fns/formatDistance';
import { format } from 'date-fns/format';
import Link from 'next/link';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../../ui/tooltip';
import type { CommunityFunctionListGetPayload } from '../../../data/functions/community/types';
import { Badge } from '../../../ui/badge';

interface CommunityFunctionItemProps {
  functionData: CommunityFunctionListGetPayload;
  href: string;
}

export const CommunityFunctionItem: React.FC<React.PropsWithChildren<CommunityFunctionItemProps>> = (props) => {
  const { children, functionData, href } = props;
  const authorName = functionData?.owner?.profile?.userName || 'Anonymous';
  const totalArguments = functionData.arguments.length;

  return (
    <div className="flex flex-col bg-secondary border border-gray-500 hover:border-gray-300 shadow-md rounded-sm px-4 py-2 w-full min-h-[200px]">
      <Link href={href} className="block space-y-2 py-2 h-full cursor-pointer" role="button" tabIndex={0} aria-pressed="false">
        <p className="text-gray-400 text-xs">{functionData.httpVerb}</p>
        <h2 className="text-lg font-bold text-gray-100 truncate min-w-0" title={functionData.slug}>
          {functionData.slug}
        </h2>
        <span className="block">
          <span className={`px-2 py-1 inline-flex text-xs leading-3 font-semibold rounded-full bg-green-700 text-green-200`}>{authorName}</span>
          {functionData.tags.map((tag) => (
            <Badge key={tag.id} variant="accent" className="mr-1 text-xs">
              {tag.name}
            </Badge>
          ))}
        </span>
        {totalArguments > 0 && (
          <span className="block">
            <p className="text-xs text-gray-400">
              {totalArguments} argument{totalArguments > 1 ? 's' : ''}
            </p>
          </span>
        )}
      </Link>
      <div className="grid grid-cols-12">
        <div className="col-span-8 flex justify-start items-center">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <p className="text-xs text-gray-500">
                  <ClockIcon className="inline h-4 w-4 mr-1" />
                  {formatDistance(functionData.updatedAt, Date.now(), {
                    addSuffix: true,
                  })}
                </p>
              </TooltipTrigger>
              <TooltipContent>
                <p className="truncate min-w-0">Last update on {format(functionData.updatedAt, 'PPpp')} </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="col-span-4 flex justify-end items-center"></div>
      </div>
      {children}
    </div>
  );
};
