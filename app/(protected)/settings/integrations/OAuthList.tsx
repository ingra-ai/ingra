'use client';
import { OAuthToken } from "@prisma/client";
import { TrashIcon } from '@heroicons/react/20/solid'
import format from 'date-fns/format';
import { Button } from "@components/ui/button";
import { cn } from "@lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { APP_NAME } from "@lib/constants";

type OAuthListProps = {
  oAuthTokens: OAuthToken[];
};

const getTokenDetail = (token: OAuthToken) => {
  const isActive = new Date() < token.expiryDate;
  switch (token.service) {
    case 'google-oauth':
      return {
        label: 'Google',
        state: isActive ? 'Active' : 'Inactive',
        icon: (
          <svg className="h-10 w-10 flex-shrink-0 rounded-full" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
            <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
          </svg>
        )
      };
    default:
      return {
        label: 'Unknown',
        state: isActive ? 'Active' : 'Inactive',
        icon: null
      };
  }
};

const OAuthList: React.FC<OAuthListProps> = (props) => {
  const { oAuthTokens } = props;

  function onRevoke(token: OAuthToken) {
    console.info('Not implemented yet');
  }

  return (
    <ul role="list" className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {oAuthTokens.map((token) => {
        const tokenDetail = getTokenDetail(token);
        const stateClasses = cn(
          tokenDetail.state === 'Active' ? 'bg-green-50 text-green-700 ring-green-600/20' : 'bg-red-50 text-red-700 ring-red-600/20'
        );

        return (
          <li key={token.id} className="col-span-1 divide-y divide-gray-500 rounded-lg border border-gray-600 bg-secondary text-secondary-foreground">
            <div className="flex w-full items-center justify-between space-x-6 p-6">
              <div className="flex-1 truncate">
                <div className="flex items-center space-x-3">
                  <h3 className="truncate text-sm font-medium text-gray-300">{tokenDetail.label}</h3>
                  <span className={cn("inline-flex flex-shrink-0 items-center rounded-full px-1.5 py-0.5 text-xs font-medium ring-1 ring-inset", stateClasses)}>
                    {tokenDetail.state}
                  </span>
                </div>
                <p className="mt-2 truncate text-sm text-gray-500">{token.primaryEmailAddress}</p>
                <p className="mt-1 truncate text-xs text-gray-400">Created at: {format(token.createdAt, 'yyyy-MM-dd')}</p>
              </div>
              {tokenDetail.icon}
            </div>
            <div>
              <div className="-mt-px flex divide-x divide-gray-500">
                <div className="flex w-0 flex-1 p-1">
                  <Dialog>
                    <DialogTrigger
                      className="relative -mr-px inline-flex w-0 flex-1 items-center justify-center gap-x-3 rounded-bl-lg rounded-br-lg border border-transparent py-4 text-sm font-semibold"
                      type='button'
                    >
                      <TrashIcon className="h-5 w-5" aria-hidden="true" />
                      Revoke
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Are you absolutely sure?</DialogTitle>
                        <DialogDescription className="py-4 space-y-4 leading-6">
                          <p>Your privacy is paramount to us, and we handle it with the utmost seriousness. Should you choose to revoke access, re-authorization of our application for your account access will be necessary.</p>

                          <p>For enhanced security, we recommend visiting your Google Account&apos;s connections section before proceeding with this step. This allows you to remove <strong>{APP_NAME}</strong> from your list of connected applications directly.</p>

                          <p>
                            For convenience, you can follow the link below:<br />
                            <a className="underline text-white" href="https://myaccount.google.com/connections" target="_blank" rel="noopener noreferrer">Manage your Google Account connections</a>.
                          </p>
                        </DialogDescription>
                        <DialogFooter>
                          <Button variant='destructive' type="button" onClick={() => onRevoke(token)}>Revoke</Button>
                        </DialogFooter>
                      </DialogHeader>
                    </DialogContent>
                  </Dialog>
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
