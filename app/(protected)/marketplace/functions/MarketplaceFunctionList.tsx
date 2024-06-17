'use client';
import React, { useTransition, useState, type JSX } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import MarketplaceFunctionItem from './MarketplaceFunctionItem';
import { useToast } from '@components/ui/use-toast';
import { ToastAction } from "@components/ui/toast"
import { cloneFunction, subscribeToggleFunction } from '@actions/functions';
import type { FunctionMarketListGetPayload, FunctionSubscriptionMarketplaceListGetPayload } from '@protected/marketplace/functions/types';
import { EyeIcon } from '@heroicons/react/24/outline';
import { Button } from '@components/ui/button';
import { RefreshCcw, RssIcon, CopyPlusIcon, ListChecksIcon } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface MarketplaceFunctionListProps {
  functions: FunctionMarketListGetPayload[];
  subscribedFunctions: FunctionSubscriptionMarketplaceListGetPayload[];
}

const MarketplaceFunctionList: React.FC<MarketplaceFunctionListProps> = ({ functions, subscribedFunctions }) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isSubscribeLoading, setIsSubscribeLoading] = useState<false | string>(false);
  const [isCloneLoading, setIsCloneLoading] = useState<false | string>(false);
  const { toast } = useToast();

  const handleSubscribeToggle = async (functionId: string) => {
    setIsSubscribeLoading(functionId);
    return subscribeToggleFunction(functionId).then((result) => {
      if (result.status !== 'ok') {
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
    }).finally(() => {
      setIsSubscribeLoading(false);
    });
  };

  const handleClone = async (functionId: string) => {
    setIsCloneLoading(functionId);

    const clonedFunction = await cloneFunction(functionId).then((result) => {
      if (result.status !== 'ok') {
        throw new Error(result.message);
      }
      const toastProps = {
        title: 'Function cloned!',
        description: 'Your function has been cloned.',
        action: <></> as JSX.Element,
      };

      if (result?.data?.id) {
        toastProps.action = (
          <ToastAction altText="Cloned Function" onClick={() => router.replace(`/mine/functions/edit/${result.data.id}`)}>
            <ListChecksIcon className="w-3 h-3 mr-3" /> Cloned Function
          </ToastAction>
        );
      }

      toast(toastProps);
      router.refresh();
    })
    .catch((error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: error?.message || 'Failed to perform operation!',
      });
    })
    .finally(() => {
      setIsCloneLoading(false);
    });
  };

  return functions.map(func => {
    const isSubscribed = subscribedFunctions.some(subscribedFunc => subscribedFunc.functionId === func.id),
      isSubscribing = isSubscribeLoading === func.id,
      isCloning = isCloneLoading === func.id;

    return (
      <MarketplaceFunctionItem
        key={func.id}
        functionData={func}
        href={`/marketplace/functions/view/${func.id}`}
      >
        <div className="flex items-center justify-center mt-4 bg-card border rounded-[10px] px-3 py-2">
          <Link href={`/marketplace/functions/view/${func.id}`} aria-label='View' title='View' className="p-1 mr-2">
            <EyeIcon className="h-4 w-4" />
          </Link>
          <button type='button' disabled={isCloning} onClick={() => handleClone(func.id)} title='Clone this function' className="hover:text-teal-500">
            {
              isCloning ? (
                <RefreshCcw className="w-4 h-4 animate-spin inline-block" />
              ) : (
                <CopyPlusIcon className="h-4 w-4 ml-2" />
              )
            }
          </button>
          <div className="w-full"></div>
          {
            isSubscribed ? (
              <Button onClick={() => handleSubscribeToggle(func.id)} disabled={isSubscribing} type='button' variant='outline' aria-label='Unsubscribe' title='Unsubscribe' className="text-xs px-3 py-2 h-auto rounded-3xl text-destructive">
                {isSubscribing && <RefreshCcw className="w-4 h-4 animate-spin inline-block mr-2" />}
                <span>Unsubscribe</span>
              </Button>
            ) : (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button type='button' disabled={isSubscribing} variant='outline' aria-label='Subscribe' title='Subscribe' className="text-xs px-3 py-2 h-auto rounded-3xl">
                    {
                      isSubscribing ?
                        <RefreshCcw className="w-4 h-4 animate-spin inline-block mr-2" /> :
                        <RssIcon className="w-4 h-4 inline-block mr-2" />
                    }
                    <span>Subscribe</span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure to subscribe &quot;{func.slug}&quot; from {func.owner.profile?.userName}?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Subscribing to this function allows you to receive updates and improvements made to the original version. However, please note that you won&apos;t be able to customize or modify the function.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleSubscribeToggle(func.id)} disabled={isSubscribing}>Continue</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )
          }
        </div>

      </MarketplaceFunctionItem>
    );
  });
};

export default MarketplaceFunctionList;
