import React, { useState, useEffect, useCallback } from 'react';
import { FolderPlusIcon, Check, ChevronDown, Loader2 } from 'lucide-react';
import { cn } from '@repo/shared/lib/utils';
import { fetchCollectionsForFunction } from '@repo/shared/data/collections';
import { FunctionCardPayload } from './types';
import { Button } from '@repo/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@repo/components/ui/popover';
import { toast } from '@repo/components/ui/use-toast';
import { collectionToggleFunction } from '@repo/shared/actions/functions';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@repo/components/ui/command';

type CollectionForFunction = Awaited<ReturnType<typeof fetchCollectionsForFunction>>[0];

type AddFunctionToCollectionButtonProps = React.HTMLAttributes<HTMLDivElement> & {
  functionRecord: FunctionCardPayload;
  userId: string;
};

const AddFunctionToCollectionButton: React.FC<AddFunctionToCollectionButtonProps> = (props) => {
  const { functionRecord, userId, ...divProps } = props;
  const [open, setOpen] = useState(false);
  const [collections, setCollections] = useState<CollectionForFunction[]>([]);
  const [loading, setLoading] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const throttledSearch = useCallback((query: string) => {
    const timer = setTimeout(() => {
      setSearchQuery(query);
    }, 700);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (open) {
      handleSearch('');
    }
  }, [open]);

  const handleSearch = async (query: string) => {
    setLoading(true);
    try {
      const fetchedCollections = await fetchCollectionsForFunction(query, functionRecord?.id, userId);
      setCollections(fetchedCollections);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch collections. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCollectionToggle = async (collection: CollectionForFunction) => {
    if (!functionRecord?.id) return;

    const ownerUsername = functionRecord?.owner?.profile?.userName || '';
    if (!ownerUsername) return;

    setToggling(true);
    try {
      const action = collection.isFunctionSubscribed ? 'remove' : 'add';
      const result = await collectionToggleFunction(collection.id, functionRecord.id, action);

      if (result.status !== 'ok') {
        throw new Error(result.message);
      }

      setCollections((prevCollections) => prevCollections.map((c) => (c.id === collection.id ? { ...c, isFunctionSubscribed: !c.isFunctionSubscribed } : c)));

      toast({
        title: 'Success!',
        description: result.message,
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: error instanceof Error ? error.message : 'Failed to handle collection!',
      });
    } finally {
      setToggling(false);
    }
  };

  if (!userId) {
    return null;
  }

  return (
    <div {...divProps}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between" disabled={toggling}>
            {toggling ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <FolderPlusIcon className="mr-2 h-4 w-4" />
                Add to Collection
              </>
            )}
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0">
          <Command>
            <CommandInput placeholder="Search collections..." onValueChange={throttledSearch} />
            <CommandEmpty>No collections found.</CommandEmpty>
            <CommandList>
              {loading ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              ) : (
                collections.map((collection) => (
                  <CommandItem key={collection.id} value={collection.name} onSelect={() => handleCollectionToggle(collection)} className="cursor-pointer">
                    <div className={cn('mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary', collection.isFunctionSubscribed ? 'bg-primary text-primary-foreground' : 'opacity-50')}>
                      <Check className={cn('h-4 w-4', collection.isFunctionSubscribed ? 'opacity-100' : 'opacity-0')} />
                    </div>
                    {collection.name}
                  </CommandItem>
                ))
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default AddFunctionToCollectionButton;
