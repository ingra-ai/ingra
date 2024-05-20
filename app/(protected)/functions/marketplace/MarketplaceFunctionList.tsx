'use client';
import React from 'react';
import MarketplaceFunctionItem from './MarketplaceFunctionItem';
import { useRouter } from 'next/navigation';
import { useToast } from '@components/ui/use-toast';
import { deleteFunction } from '@protected/functions/actions/functions';
import { FunctionMarketListGetPayload } from './types';

interface MarketplaceFunctionListProps {
  functions: FunctionMarketListGetPayload[];
}

const MarketplaceFunctionList: React.FC<MarketplaceFunctionListProps> = ({ functions }) => {
  const router = useRouter();
  const { toast } = useToast();

  const handleFork = (id: string) => {
    console.log({ id })
    // router.push(`/functions/fork/${id}`);
  }

  const handleEdit = (id: string) => {
    router.push(`/functions/edit/${id}`);
  };

  const handleDelete = (id: string) => {
    deleteFunction(id).then(() => {
      toast({
        title: 'Success!',
        description: 'Function has been deleted successfully.',
      });
      router.replace(`/functions`);
      router.refresh();
    }).catch((error) => {
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: error?.message || 'Failed to delete function!',
      });
    });
  };

  return functions.map(func => (
    <MarketplaceFunctionItem
      key={func.id}
      functionData={func}
      onFork={() => handleFork(func.id)}
    />
  ));
};

export default MarketplaceFunctionList;
