'use client';
import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '../../../ui/use-toast';
import { ToastAction } from '../../../ui/toast';
import { cloneFunction, subscribeToggleFunction } from '@repo/shared/actions/functions';
import type { CommunityFunctionListGetPayload } from '../../../data/functions/community/types';
import { CommunityFunctionItem } from './CommunityFunctionItem';
import { EyeIcon } from '@heroicons/react/24/outline';
import { Button } from '../../../ui/button';
import { RefreshCcw, RssIcon, CopyPlusIcon, ListChecksIcon } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../../../ui/alert-dialog';
import { getUserRepoFunctionsViewUri } from '@repo/shared/lib/constants/repo';

interface CommunityFunctionsListProps {
  showControls: boolean;
  functionRecords: CommunityFunctionListGetPayload[];
}

const CommunityFunctionsList: React.FC<CommunityFunctionsListProps> = (props) => {
  const { showControls = false, functionRecords } = props;
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isSubscribeLoading, setIsSubscribeLoading] = useState<false | string>(false);
  const [isCloneLoading, setIsCloneLoading] = useState<false | string>(false);
  const { toast } = useToast();

  const handleSubscribeToggle = async (functionId: string) => {
    setIsSubscribeLoading(functionId);
    return subscribeToggleFunction(functionId)
      .then((result) => {
        if (result.status !== 'ok') {
          throw new Error(result.message);
        }

        toast({
          title: 'Success!',
          description: result?.message || 'Function has been subscribed successfully.',
        });

        startTransition(router.refresh);
      })
      .catch((error) => {
        toast({
          variant: 'destructive',
          title: 'Uh oh! Something went wrong.',
          description: error?.message || 'Failed to handle subscription!',
        });
      })
      .finally(() => {
        setIsSubscribeLoading(false);
      });
  };

  const handleClone = async (functionId: string) => {
    setIsCloneLoading(functionId);

    return await cloneFunction(functionId)
      .then((result) => {
        if (result.status !== 'ok') {
          throw new Error(result.message);
        }

        const toastProps = {
          title: 'Function cloned!',
          description: 'Your function has been cloned.',
          action: (<></>) as React.JSX.Element,
        };

        const functionHref = result?.data?.href;

        if (functionHref) {
          toastProps.action = (
            <ToastAction altText="Cloned Function" onClick={() => router.replace(functionHref)}>
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

  return functionRecords.map((functionRecord) => {
    const isSubscribing = isSubscribeLoading === functionRecord.id,
      isCloning = isCloneLoading === functionRecord.id,
      href = getUserRepoFunctionsViewUri(functionRecord.owner.profile?.userName || '', functionRecord.id);

    return (
      <CommunityFunctionItem key={functionRecord.id} functionData={functionRecord} href={href}>
        <div className="flex items-center justify-center mt-4 bg-card border rounded-[10px] px-3 py-2">
          <Link href={href} aria-label="View" title="View" className="p-1 mr-2">
            <EyeIcon className="h-4 w-4" />
          </Link>
          {showControls && (
            <>
              <button type="button" disabled={isCloning} onClick={() => handleClone(functionRecord.id)} title="Clone this function" className="hover:text-teal-500">
                {isCloning ? <RefreshCcw className="w-4 h-4 animate-spin inline-block" /> : <CopyPlusIcon className="h-4 w-4 ml-2" />}
              </button>
              <div className="w-full"></div>
              {functionRecord.isSubscribed ? (
                <Button
                  onClick={() => handleSubscribeToggle(functionRecord.id)}
                  disabled={isSubscribing}
                  type="button"
                  variant="outline"
                  aria-label="Unsubscribe"
                  title="Unsubscribe"
                  className="text-xs px-3 py-2 h-auto rounded-3xl text-destructive"
                >
                  {isSubscribing && <RefreshCcw className="w-4 h-4 animate-spin inline-block mr-2" />}
                  <span>Unsubscribe</span>
                </Button>
              ) : (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button type="button" disabled={isSubscribing} variant="outline" aria-label="Subscribe" title="Subscribe" className="text-xs px-3 py-2 h-auto rounded-3xl">
                      {isSubscribing ? <RefreshCcw className="w-4 h-4 animate-spin inline-block mr-2" /> : <RssIcon className="w-4 h-4 inline-block mr-2" />}
                      <span>Subscribe</span>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Are you sure to subscribe &quot;{functionRecord.slug}
                        &quot; from {functionRecord.owner.profile?.userName}?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        Subscribing to this function allows you to receive updates and improvements made to the original version. However, please note that you won&apos;t be able to customize or modify the function.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleSubscribeToggle(functionRecord.id)} disabled={isSubscribing}>
                        Continue
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </>
          )}
        </div>
      </CommunityFunctionItem>
    );
  });
};

export default CommunityFunctionsList;
