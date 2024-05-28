'use client';
import React, { useTransition } from 'react';
import MarketplaceFunctionItem from './MarketplaceFunctionItem';
import { PencilIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ToastAction } from "@/components/ui/toast"
import { useToast } from '@components/ui/use-toast';
import { forkFunction, subscribeToggleFunction } from '@protected/functions/actions/functions';
import type { FunctionMarketListGetPayload, FunctionSubscriptionMarketplaceListGetPayload } from '@protected/functions/marketplace/types';
import { Function } from '@prisma/client';

interface MarketplaceFunctionListProps {
  functions: FunctionMarketListGetPayload[];
  subscribedFunctions: FunctionSubscriptionMarketplaceListGetPayload[];
}

const MarketplaceFunctionList: React.FC<MarketplaceFunctionListProps> = ({ functions, subscribedFunctions }) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const redirectToEdit = (payload: Partial<Function>)  => {
    router.push(`/functions/edit/${payload?.id}`);
  }

  const handleView = (id: string) => {
    router.push(`/functions/marketplace/view/${id}`);
  };

  const handleFork = async (id: string) => {
    return forkFunction(id).then((result) => {
      if ( result.status !== 'ok' ) {
        throw new Error(result.message);
      }

      toast({
        title: 'Success!',
        description: result?.message || 'Function has been forked successfully.',
        action: result?.data?.id ? (
          <ToastAction altText="Edit Function" onClick={ () => redirectToEdit(result.data)}>
            <PencilIcon className="w-3 h-3 mr-3" /> Edit Function
          </ToastAction>
        ) : undefined,
      });

      startTransition(router.refresh);
    }).catch((error) => {
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: error?.message || 'Failed to fork function!',
      });
    });
  }

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
        onFork={async () => handleFork(func.id)}
        onSubscribeToggle={async () => handleSubscribeToggle(func.id)}
        onView={() => handleView(func.id)}
      />
    );
  });
};

export default MarketplaceFunctionList;
