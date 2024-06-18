'use client';
import React, { useTransition } from 'react';
import { FunctionItem } from './FunctionItem';
import { useRouter } from 'next/navigation';
import { useToast } from '@components/ui/use-toast';
import { subscribeToggleFunction } from '@actions/functions';
import type { FunctionSubscriptionListGetPayload } from '@protected/subscriptions/functions/types';

interface FunctionsListProps {
  functionSubscriptions: FunctionSubscriptionListGetPayload[];
}

const FunctionsList: React.FC<FunctionsListProps> = (props) => {
  const { functionSubscriptions } = props;
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleView = (id: string) => {
    router.push(`/marketplace/functions/view/${id}`);
  };

  const handleUnsubscribe = (id: string) => {
    subscribeToggleFunction(id).then((result) => {
      if ( result.status !== 'ok' ) {
        throw new Error(result.message);
      }

      toast({
        title: 'Success!',
        description: result?.message || 'Function has been unsubscribed.'
      });

      startTransition(router.refresh);

    }).catch((error) => {
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: error?.message || 'Failed to unsubscribe function!',
      });
    });
  };

  return (
    <>
      {functionSubscriptions.map(funcSubscription => (
        <FunctionItem
          key={funcSubscription.id}
          functionSubscriptionData={funcSubscription}
          onUnsubscribe={() => handleUnsubscribe(funcSubscription.functionId)}
          onView={() => handleView(funcSubscription.functionId)}
        />
      ))}
    </>
  );
};

export default FunctionsList;
