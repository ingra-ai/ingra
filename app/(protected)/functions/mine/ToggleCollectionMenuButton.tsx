import React from 'react';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { FolderPlusIcon } from 'lucide-react';
import { Button } from '@components/ui/button';
import { type CollectionListGetPayload } from '@protected/functions/mine/types';
import { cn } from '@lib/utils';

type ToggleCollectionMenuButtonProps = React.HTMLAttributes<HTMLDivElement> & {
  functionId: string;
  collections: CollectionListGetPayload[];
  onCheckedChange: (collectionId: string, functionId: string, checked: boolean) => void;
}

const ToggleCollectionMenuButton: React.FC<ToggleCollectionMenuButtonProps> = (props) => {
  const { functionId, collections, onCheckedChange, ...divProps } = props;

  const handleCheckedChange = ( collectionId: string, checked: boolean ) => {
    if ( typeof onCheckedChange === 'function' ) {
      onCheckedChange(collectionId, functionId, checked);
    }
  };

  if ( !collections.length ) {
    return null;
  }

  const classes = cn('p-2', divProps.className);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open collections menu</span>
          <FolderPlusIcon className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" { ...divProps } className={ classes }>
        <DropdownMenuLabel>Collections</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {
          collections.map( ( collection ) => {
            const isSelected = collection.functions.some(func => func.id === functionId);

            return (
              <DropdownMenuCheckboxItem
                key={collection.id}
                checked={isSelected}
                className='hover:bg-secondary hover:text-secondary-foreground cursor-pointer leading-6'
                onCheckedChange={( checked ) => handleCheckedChange(collection.id, checked) }
              >
                {collection.name}
              </DropdownMenuCheckboxItem>
            );
          })
        }
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ToggleCollectionMenuButton;