import React from 'react';
import { CollectionMarketplaceListGetPayload } from '@protected/marketplace/collections/types';
import { SquareDashedBottomCodeIcon, RssIcon, TagIcon } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import Link from 'next/link';
import { cn } from '@lib/utils';

interface MarketplaceCollectionCardProps extends React.HTMLAttributes<HTMLDivElement> {
  collection: CollectionMarketplaceListGetPayload;
  href: string;
}

const MarketplaceCollectionCard: React.FC<React.PropsWithChildren<MarketplaceCollectionCardProps>> = (props) => {
  const { collection, href, children, ...divProps } = props;

  const functionNames = collection.functions.map((fn) => fn.slug);
  const functionNamesText = functionNames.slice(0, 2).join(', ') + (functionNames.length > 2 ? `, and +${functionNames.length - 2} more` : '');

  const allTags = new Set(...collection.functions.map((fn) => fn.tags.flatMap((tag) => tag.name)));
  const allTagsText = Array.from(allTags).slice(0, 2).join(', ') + (allTags.size > 2 ? `, and +${allTags.size - 2} more` : '');

  const classes = cn('p-4 rounded-lg bg-card border shadow-md', divProps.className);

  return (
    <div data-testid='collection-card' {...divProps} className={classes}>
      <div className="min-w-0 space-y-2">
        <Link className='block w-full leading-6' href={ href }>
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
      { children }
    </div>
  );
};

export default MarketplaceCollectionCard;