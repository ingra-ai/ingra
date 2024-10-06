'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SearchIcon, ChevronDownIcon } from 'lucide-react';
import { cn } from '@repo/shared/lib/utils';
import { Input } from '@repo/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/components/ui/dropdown-menu";

export type BakaSearchSortItem = {
  key: string;
  title: string;
};

export type BakaSearchType = {
  q: string;
  sortBy: string;
};

type BakaSearchProps = BakaSearchType & {
  sortItems?: BakaSearchSortItem[];
  className?: string;
};

const DEFAULT_SORT_ITEM = {
  key: 'updatedAt_desc',
  title: 'Last Updated'
};

export const BakaSearch: React.FC<BakaSearchProps> = (props) => {
  const {
    q = '',
    sortBy: sortKey = 'updatedAt_desc',
    className,
    sortItems = [DEFAULT_SORT_ITEM]
  } = props;
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState(q);

  const selectedSortKey = sortItems.find((sortItem) => sortItem.key === sortKey) || DEFAULT_SORT_ITEM;

  const handleOnSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const url = new URL(window.location.href);

    if ( !searchTerm ) {
      url.searchParams.delete('q');
    }
    else {
      url.searchParams.set('q', searchTerm);
    }

    router.push(url.toString());
  }

  const handleSort = (sortKey: string) => {
    const url = new URL(window.location.href);

    if ( !sortKey || sortKey === DEFAULT_SORT_ITEM.key ) {
      url.searchParams.delete('sortBy');
    }
    else {
      url.searchParams.set('sortBy', sortKey);
    }

    router.push(url.toString());
  };

  return (
    <div className={cn("flex flex-row justify-between items-start sm:items-center space-y-0 space-x-4 mb-4", className)} data-testid="baka-search">
      <div className="flex-1 w-auto">
        <form className="block relative" onSubmit={handleOnSearch}>
          <Input
            type="text"
            autoComplete='search'
            placeholder={`Search...`}
            className="w-full pl-10 pr-4"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
          <button type="submit" style={{ display: 'none' }}></button>
        </form>
      </div>
      <div className="flex items-center space-x-4">
        <DropdownMenu>
          <DropdownMenuTrigger
            type="button"
            className="inline-flex justify-center w-full rounded-md border shadow-sm px-4 py-2 bg-gray-100 dark:bg-gray-900 text-sm font-medium text-indigo-900 dark:text-indigo-100 hover:bg-gray-50 dark:hover:bg-gray-950 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-900 focus:ring-indigo-500"
            id="sort-menu"
            aria-expanded="true"
            aria-haspopup="true"
          >
            Sort: {selectedSortKey.title}
            <ChevronDownIcon className="-mr-1 ml-2 h-5 w-5" aria-hidden="true" />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Sort By</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {sortItems.map((sortItem) => {
              return (
                <DropdownMenuItem className="cursor-pointer" key={sortItem.key} onClick={() => handleSort(sortItem.key)}>
                  {sortItem.title}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
