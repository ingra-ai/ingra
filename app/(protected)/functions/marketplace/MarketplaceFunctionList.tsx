'use client';
import React, { useTransition } from 'react';
import MarketplaceFunctionItem from './MarketplaceFunctionItem';
import { useRouter } from 'next/navigation';
import { useToast } from '@components/ui/use-toast';
import { subscribeToggleFunction } from '@protected/functions/actions/functions';
import type { FunctionMarketListGetPayload, FunctionSubscriptionMarketplaceListGetPayload } from '@protected/functions/marketplace/types';

interface MarketplaceFunctionListProps {
  functions: FunctionMarketListGetPayload[];
  subscribedFunctions: FunctionSubscriptionMarketplaceListGetPayload[];
}

const MarketplaceFunctionList: React.FC<MarketplaceFunctionListProps> = ({ functions, subscribedFunctions }) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleView = (id: string) => {
    router.push(`/functions/marketplace/view/${id}`);
  };

  const handleSubscribeToggle = async (id: string) => {
    return subscribeToggleFunction(id).then((result) => {
      if ( result.status !== 'ok' ) {
        throw new Error(result.message);
      }

      toast({
        title: 'Success!',
        description: result?.message || 'Function has been subscribed successfully.'
      });

      startTransition(router.refresh);
    }).catch((error) => {
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: error?.message || 'Failed to handle subscription!',
      });
    });
  }

  return functions.map(func => {
    const isSubscribed = subscribedFunctions.some(subscribedFunc => subscribedFunc.functionId === func.id);
    return (
      <MarketplaceFunctionItem
        key={func.id}
        functionData={func}
        isSubscribed={isSubscribed}
        onSubscribeToggle={async () => handleSubscribeToggle(func.id)}
        onView={() => handleView(func.id)}
      />
    );
  });
};

export default MarketplaceFunctionList;
