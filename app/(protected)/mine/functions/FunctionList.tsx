'use client';
import React from 'react';
import { FunctionItem, FunctionItemNew } from './FunctionItem';
import { useRouter } from 'next/navigation';
import { useToast } from '@components/ui/use-toast';
import { collectionToggleFunction, deleteFunction } from '@actions/functions';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import type { FunctionListGetPayload, CollectionListGetPayload } from '@protected/mine/functions/types';
import ToggleCollectionMenuButton from './ToggleCollectionMenuButton';

interface FunctionsListProps {
  functions: FunctionListGetPayload[];
  collections: CollectionListGetPayload[];
}

const FunctionsList: React.FC<FunctionsListProps> = ({ functions, collections }) => {
  const router = useRouter();
  const { toast } = useToast();

  const handleEdit = (functionId: string) => {
    router.push(`/mine/functions/edit/${functionId}`);
  };

  const onFunctionCollectionToggleChanged = (collectionId: string, functionId: string, checked: boolean) => {
    const action = checked ? 'add' : 'remove';

    collectionToggleFunction(collectionId, functionId, action).then((result) => {
      if (result.status !== 'ok') {
        throw new Error(result.message);
      }

      toast({
        title: 'Success!',
        description: result.message,
      });

      router.replace(`/mine/functions`);
      router.refresh();
    }).catch((error) => {
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: error?.message || 'Failed to handling collection!',
      });
    });
  }

  const handleDelete = (functionId: string) => {
    // Prompt user
    const confirmed = confirm(`Are you sure to delete function? This action cannot be undone. This will permanently delete your function.`);

    if (confirmed) {
      deleteFunction(functionId).then((result) => {
        if (result.status !== 'ok') {
          throw new Error(result.message);
        }

        toast({
          title: 'Success!',
          description: 'Function has been deleted successfully.',
        });

        router.replace(`/mine/functions`);
        router.refresh();
      }).catch((error) => {
        toast({
          variant: 'destructive',
          title: 'Uh oh! Something went wrong.',
          description: error?.message || 'Failed to delete function!',
        });
      });
    }
  };

  return (
    <>
      <FunctionItemNew />
      {functions.map((functionData) => {
        return (
          <FunctionItem key={functionData.id} functionData={functionData} href={`/mine/functions/edit/${functionData.id}`}>
            <div className="flex mt-4 bg-card border rounded-[10px] px-3 py-2">
              <ToggleCollectionMenuButton
                functionId={functionData.id}
                collections={collections}
                onCheckedChange={onFunctionCollectionToggleChanged}
                className="p-2 bg-card"
              />
              <div className="w-full"></div>
              <button type='button' onClick={() => handleEdit(functionData.id)} aria-label='Edit' title='Edit' className="text-info hover:text-info-foreground p-2 hover:bg-accent">
                <PencilIcon className="h-4 w-4" />
              </button>
              <button type='button' onClick={() => handleDelete(functionData.id)} aria-label='Delete' title='Delete' className="text-destructive hover:text-destructive-foreground p-2 hover:bg-accent">
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          </FunctionItem>
        );
      })}
    </>
  );
};

export default FunctionsList;
