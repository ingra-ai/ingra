'use client';
import { TrashIcon } from '@heroicons/react/20/solid';
import { Alert, AlertDescription, AlertTitle } from '@repo/components/ui/alert';
import { Badge } from '@repo/components/ui/badge';
import { Button } from '@repo/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@repo/components/ui/dialog';
import { useToast } from '@repo/components/ui/use-toast';
import { OAuthToken } from '@repo/db/prisma';
import { revokeOAuth, setTokenAsDefault } from '@repo/shared/actions/oauth';
import { APP_NAME } from '@repo/shared/lib/constants';
import { cn } from '@repo/shared/lib/utils';
import { formatDistance } from 'date-fns';
import { RefreshCcw, RocketIcon, TentIcon } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { startTransition, useState } from 'react';

import type { FC } from 'react';

type OAuthListProps = {
  oAuthTokens: OAuthToken[];
};

type TokenDetailReturnType = {
  label: string;
  alert: React.ReactNode;
  state: React.ReactNode;
  autoRenew: React.ReactNode;
  icon: React.ReactNode;
};

const getTokenDetail = (token: OAuthToken): TokenDetailReturnType => {
  const isActive = new Date() < token.expiryDate;
  const unableToRenew = !isActive && token.service === 'google-oauth' && !token.refreshToken;
  const formatExpiredAt = formatDistance(token.expiryDate, Date.now(), {
    addSuffix: true,
  });

  const stateClasses = cn('inline-flex flex-shrink-0 items-center rounded-full px-1.5 py-0.5 text-xs font-medium ring-1 ring-inset', {
    'bg-green-50 text-green-700 ring-green-600/20': isActive,
    'bg-red-50 text-red-700 ring-red-600/20': !isActive,
  });

  const ExpiredAtNode = (
    <span className={ stateClasses } title={formatExpiredAt} aria-label={formatExpiredAt}>Expired</span>
  );

  const ActiveNode = (
    <span className={ stateClasses } title={formatExpiredAt} aria-label={formatExpiredAt}>Active</span>
  );

  const defaultProps: TokenDetailReturnType = {
    label: 'Unknown',
    alert: unableToRenew ? (
      <Alert variant="warning" className="text-xs">
        <RocketIcon className="h-4 w-4 dark:text-gray-300 text-gray-700 fill-gray-300 dark:fill-gray-700" />
        <AlertTitle>Heads up!</AlertTitle>
        <AlertDescription>
          Auto-refresh feature has been disabled for this OAuth. To re-connect your account, you need to&nbsp;
          <a className="underline" href="https://myaccount.google.com/connections" target="_blank" rel="noopener noreferrer">
            Disconnect <code>{APP_NAME}</code> from your Google Account
          </a>
        </AlertDescription>
      </Alert>
    ) : null,
    state: isActive ? ActiveNode : ExpiredAtNode,
    autoRenew: !unableToRenew && (
      <div className='flex flex-row items-center justify-start text-info'>
        <RefreshCcw className='w-4 h-4 mr-2' />
        <p className="truncate text-xs">
          Auto-refresh on API calls
        </p>
      </div>
    ),
    icon: null,
  };

  switch (token.service) {
    case 'google-oauth':
      return {
        ...defaultProps,
        label: 'Google',
        state: isActive ? ActiveNode : ExpiredAtNode,
        icon: (
          <svg className="h-10 w-10 flex-shrink-0 rounded-full" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
            <path
              fill="currentColor"
              d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
            ></path>
          </svg>
        ),
      };
    case 'ingra-oauth':
      return {
        ...defaultProps,
        label: APP_NAME,
        state: isActive ? ActiveNode : ExpiredAtNode,
        alert: null,
        icon: (
          <Image src={'/static/brand/ingra-logo-dark.svg'} width={50} height={50} className="h-10 w-10 flex-shrink-0" alt={APP_NAME + ' Logo'} suppressHydrationWarning />
        ),
      };
    default:
      return defaultProps;
  }
};

const OAuthList: FC<OAuthListProps> = (props) => {
  const { oAuthTokens } = props;
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState<false | string>(false);

  function onRevoke(token: OAuthToken) {
    setIsLoading(token.id);

    revokeOAuth(token)
      .then((result) => {
        if (result.status !== 'ok') {
          throw new Error(result.message);
        }

        toast({
          title: 'Token has been revoked!',
          description: 'Access token has been successfully revoked.',
        });

        startTransition(() => {
          // Refresh the current route and fetch new data from the server without
          // losing client-side browser or React state.
          router.refresh();
        });
      })
      .catch((error: any) => {
        toast({
          title: 'Uh oh! Something went wrong.',
          description: error?.message || 'Failed to revoke token!',
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  function onSetDefault(token: OAuthToken) {
    setIsLoading(token.id);

    setTokenAsDefault(token)
      .then((result) => {
        if (result.status !== 'ok') {
          throw new Error(result.message);
        }

        toast({
          title: 'Token has been set as default!',
          description: result.message || `Token has been successfully set as default.`,
        });

        startTransition(() => {
          // Refresh the current route and fetch new data from the server without
          // losing client-side browser or React state.
          router.refresh();
        });
      })
      .catch((error: any) => {
        toast({
          title: 'Uh oh! Something went wrong.',
          description: error?.message || 'Failed to set default token!',
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  return (
    <ul role="list" className="flex flex-wrap gap-4">
      {oAuthTokens.map((token) => {
        const tokenDetail = getTokenDetail(token);
        const isTokenLoading = isLoading === token.id;
        const isTokenDefault = token.isDefault;
        // const hasBeenExpiredFor = formatDistance(token.expiryDate, Date.now(), {
        //   addSuffix: true,
        // });
        const lastUpdatedAt = formatDistance(token.updatedAt, Date.now(), {
          addSuffix: true,
        });

        return (
          <li key={token.id} className="flex-auto max-w-96">
            {
              tokenDetail.alert && (
                <div className="mb-2">{tokenDetail.alert}</div>
              )
            }
            <div className="col-span-1 divide-y rounded-lg border dark:border-gray-600 dark:divide-gray-600 border-gray-400 divide-gray-400 bg-secondary text-secondary-foreground dark:text-secondary-foreground">
              <div className="flex w-full items-center justify-between space-x-6 p-6">
                <div className="flex-1 truncate">
                  <div className="flex items-center space-x-3">
                    <h3 className="truncate text-sm font-medium dark:text-gray-300 text-gray-700">{tokenDetail.label}</h3>
                    {tokenDetail.state}
                    {isTokenDefault && <Badge>Default</Badge>}
                  </div>
                  <p className="mt-2 truncate text-sm text-gray-500">{token.primaryEmailAddress}</p>
                  <p className="mt-2 truncate text-xs dark:text-gray-400 text-gray-600">Last Update: {lastUpdatedAt}</p>
                  {tokenDetail.autoRenew && <div className="mt-2">{tokenDetail.autoRenew}</div>}
                </div>
                {tokenDetail.icon}
              </div>
              <div>
                <div className="-mt-px flex divide-x divide-gray-500">
                  {
                    !token.isDefault && (
                      <div className="flex w-0 flex-1">
                        <Button type="button" onClick={() => onSetDefault(token)} disabled={isTokenLoading} className="relative -mr-px inline-flex w-0 flex-1 items-center justify-center h-full py-2 hover:text-info">
                          {isTokenLoading ? <RefreshCcw className="animate-spin inline-block mr-2" /> : <TentIcon className="h-4 w-4 mr-2" aria-hidden="true" />}
                          {isTokenLoading ? 'Setting as default...' : 'Set as Default'}
                        </Button>
                      </div>
                    )
                  }
                  <div className="flex w-0 flex-1">
                    <Dialog>
                      <DialogTrigger className="relative -mr-px inline-flex w-0 flex-1 items-center justify-center h-full py-2 hover:text-destructive" type="button">
                        <TrashIcon className="h-4 w-4 mr-2" aria-hidden="true" />
                        Revoke
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Are you absolutely sure?</DialogTitle>
                          <DialogDescription className="py-4 space-y-4 leading-6">
                            <p>Your privacy is paramount to us, and we handle it with the utmost seriousness. Should you choose to revoke access, re-authorization of our application for your account access will be necessary.</p>

                            {
                              token.service === 'google-oauth' && (
                                <>
                                  <p>
                                    For enhanced security, we recommend visiting your Google Account&apos;s connections section before proceeding with this step. This allows you to remove <strong>{APP_NAME}</strong> from your list of connected
                                    applications directly.
                                  </p>

                                  <p>
                                    For convenience, you can follow the link below:
                                    <br />
                                    <a className="underline text-white" href="https://myaccount.google.com/connections" target="_blank" rel="noopener noreferrer">
                                      Manage your Google Account connections
                                    </a>
                                    .
                                  </p>
                                </>
                              )
                            }
                          </DialogDescription>
                          <DialogFooter>
                            <Button variant="destructive" type="button" onClick={() => onRevoke(token)} disabled={isTokenLoading}>
                              {isTokenLoading && <RefreshCcw className="animate-spin inline-block mr-2" />}
                              {isTokenLoading ? 'Revoking...' : 'Revoke'}
                            </Button>
                          </DialogFooter>
                        </DialogHeader>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
};

export default OAuthList;
