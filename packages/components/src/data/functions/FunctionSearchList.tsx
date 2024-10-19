'use client';
import React, { useTransition } from 'react';
import { FunctionCard } from './FunctionCard';
import { useRouter } from 'next/navigation';
import { useToast } from '@repo/components/ui/use-toast';
import { ToastAction } from '@repo/components/ui/toast';
import { collectionToggleFunction, deleteFunction, cloneFunction, subscribeToFunction, unsubscribeToFunction, togglePublishFunction } from '@repo/shared/actions/functions';
import { ListChecksIcon } from 'lucide-react';
import type { FunctionCardPayload } from './types';
import { getUserRepoFunctionsEditUri, getUserRepoFunctionsViewUri } from '@repo/shared/lib/constants/repo';
import { AuthSessionResponse } from '@repo/shared/data/auth/session/types';
import { cn } from '@repo/shared/lib/utils';

interface FunctionSearchListProps extends React.HTMLAttributes<HTMLDivElement> {
  authSession?: AuthSessionResponse | null;
  functions: FunctionCardPayload[];
}

export const FunctionSearchList: React.FC<FunctionSearchListProps> = (props) => {
  const { authSession, functions, ...divProps } = props;
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const isUserAuthed = !!authSession;

  const handleCollectionToggle = (collectionId: string, functionRecord: FunctionCardPayload, checked: boolean) => {
    const action = checked ? 'add' : 'remove';
    const ownerUsername = functionRecord?.owner?.profile?.userName || '';

    if (!ownerUsername) {
      return Promise.reject('Owner username not found!');
    }

    return collectionToggleFunction(collectionId, functionRecord.id, action)
      .then((result) => {
        if (result.status !== 'ok') {
          throw new Error(result.message);
        }

        toast({
          title: 'Success!',
          description: result.message,
        });

        return startTransition(router.refresh);
      })
      .catch((error) => {
        toast({
          variant: 'destructive',
          title: 'Uh oh! Something went wrong.',
          description: error?.message || 'Failed to handle collection!',
        });
      });
  };

  const handleDelete = (functionRecord: FunctionCardPayload) => {
    const ownerUsername = functionRecord?.owner?.profile?.userName || '';

    if (!ownerUsername) {
      return Promise.reject('Owner username not found!');
    }

    // Prompt user
    const confirmed = confirm(`Are you sure to delete function? This action cannot be undone. This will permanently delete your function.`);

    if (confirmed) {
      return deleteFunction(functionRecord.id)
        .then((result) => {
          if (result.status !== 'ok') {
            throw new Error(result.message);
          }

          toast({
            title: 'Success!',
            description: 'Function has been deleted successfully.',
          });

          return startTransition(router.refresh);
        })
        .catch((error) => {
          toast({
            variant: 'destructive',
            title: 'Uh oh! Something went wrong.',
            description: error?.message || 'Failed to delete function!',
          });
        });
    }

    return Promise.reject();
  };

  const handleSubscribe = (functionRecord: FunctionCardPayload) => {
    return subscribeToFunction(functionRecord.id)
      .then((result) => {
        if (result.status !== 'ok') {
          throw new Error(result.message);
        }

        toast({
          title: 'Success!',
          description: result?.message || 'Function has been subscribed successfully.',
        });

        return startTransition(router.refresh);
      })
      .catch((error) => {
        toast({
          variant: 'destructive',
          title: 'Uh oh! Something went wrong.',
          description: error?.message || 'Failed to handle subscription!',
        });
      });
  };

  const handleUnsubscribe = (functionRecord: FunctionCardPayload) => {
    return unsubscribeToFunction(functionRecord.id)
      .then((result) => {
        if (result.status !== 'ok') {
          throw new Error(result.message);
        }

        toast({
          title: 'Success!',
          description: result?.message || 'Function has been unsubscribed successfully.',
        });

        return startTransition(router.refresh);
      })
      .catch((error) => {
        toast({
          variant: 'destructive',
          title: 'Uh oh! Something went wrong.',
          description: error?.message || 'Failed to handle subscription!',
        });
      });
  };

  const handleClone = (functionRecord: FunctionCardPayload) => {
    return cloneFunction(functionRecord.id)
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
        return startTransition(router.refresh);
      })
      .catch((error: Error) => {
        toast({
          variant: 'destructive',
          title: 'Uh oh! Something went wrong.',
          description: error?.message || 'Failed to perform operation!',
        });
      });
  };

  const handleTogglePublish = (functionRecord: FunctionCardPayload) => {
    // Prompt user
    const isPublished = functionRecord.isPublished;
    const confirmed = confirm(`Are you sure to ${isPublished ? 'unpublish' : 'publish'} this function?`);

    if (confirmed) {
      // Perform action
      return togglePublishFunction(functionRecord.id)
        .then((result) => {
          if (result.status !== 'ok') {
            throw new Error(result.message);
          }

          toast({
            title: 'Success!',
            description: `Function has been ${isPublished ? 'unpublished' : 'published'} successfully.`,
          });

          return startTransition(router.refresh);
        })
        .catch((error: Error) => {
          toast({
            variant: 'destructive',
            title: 'Uh oh! Something went wrong.',
            description: error?.message || `Failed to ${isPublished ? 'unpublish' : 'publish'} function!`,
          });
        });
    }

    return Promise.reject();
  }

  const classes = cn('relative', divProps.className),
    gridClasses = cn('grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4');

  return (
    <div data-testid="function-search-list" {...divProps} className={classes}>
      <div className="mx-auto space-y-6">
        <div className={gridClasses}>
          {functions.map((functionData) => {
            const isSubscribed = functionData.isSubscribed,
              ownerUsername = functionData.owner?.profile?.userName || '',
              refinedCardProps: Partial<React.ComponentProps<typeof FunctionCard>> = {},
              isCurrentUserOwner = authSession?.user?.profile?.userName && ownerUsername && authSession.user.profile.userName === ownerUsername,
              href = isCurrentUserOwner ? getUserRepoFunctionsEditUri(ownerUsername, functionData.slug) : getUserRepoFunctionsViewUri(ownerUsername, functionData.slug);

            // If user is the owner of this function, allow these actions
            if (isUserAuthed && isCurrentUserOwner) {
              refinedCardProps.handleDelete = handleDelete;
              refinedCardProps.handleTogglePublish = handleTogglePublish;
              refinedCardProps.handleClone = handleClone;
              refinedCardProps.handleCollectionToggle = handleCollectionToggle;
            } 
            else if (isUserAuthed) {
              if (isSubscribed) {
                refinedCardProps.handleUnsubscribe = handleUnsubscribe;
              } else {
                refinedCardProps.handleSubscribe = handleSubscribe;
              }
            }

            return <FunctionCard key={functionData.id} functionData={functionData} href={href} authSession={authSession} {...refinedCardProps} />;
          })}
        </div>
      </div>
    </div>
  );
};

export default FunctionSearchList;
