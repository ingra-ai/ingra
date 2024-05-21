'use client';
import React from 'react';
import MarketplaceFunctionItem from './MarketplaceFunctionItem';
import { useRouter } from 'next/navigation';
import { ToastAction } from "@/components/ui/toast"
import { useToast } from '@components/ui/use-toast';
import { forkFunction } from '@protected/functions/actions/functions';
import { FunctionMarketListGetPayload } from './types';
import { Function } from '@prisma/client';

interface MarketplaceFunctionListProps {
  functions: FunctionMarketListGetPayload[];
}

const MarketplaceFunctionList: React.FC<MarketplaceFunctionListProps> = ({ functions }) => {
  const router = useRouter();
  const { toast } = useToast();

  const redirectToEdit = (payload: Partial<Function>)  => {
    router.push(`/functions/edit/${payload?.id}`);
  }

  const handleFork = (id: string) => {
    forkFunction(id).then((result) => {
      if ( result.status !== 'ok' ) {
        throw new Error(result.message);
      }

      toast({
        title: 'Success!',
        description: 'Function has been forked successfully.',
        action: result?.data?.id ? (
          <ToastAction altText="Edit Function" onClick={ () => redirectToEdit(result.data)}>Undo</ToastAction>
        ) : undefined,
      });

    }).catch((error) => {
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: error?.message || 'Failed to fork function!',
      });
    });
  }

  return functions.map(func => (
    <MarketplaceFunctionItem
      key={func.id}
      functionData={func}
      onFork={() => handleFork(func.id)}
    />
  ));
};

export default MarketplaceFunctionList;
