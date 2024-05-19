'use client';

import { useCallback, useState, useTransition } from 'react';
import { Logger } from '@lib/logger';
import { useToast } from '@components/ui/use-toast';
import { RefreshCcw } from 'lucide-react';
import { TrashIcon } from '@heroicons/react/24/outline';
import { deleteApiKey } from '@protected/settings/actions/apiKey';
import { useRouter } from 'next/navigation';
import formatDistance from 'date-fns/formatDistance';
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
import type { ApiKey } from '@prisma/client';
import { GenerateApiKeyButton } from './GenerateApiKeyButton';

type ApiKeysTableProps = {
  apiKeys: Required<Pick<ApiKey, 'key' | 'lastUsedAt'>>[];
};

export const ApiKeysTable: React.FC<ApiKeysTableProps> = (props) => {
  const { apiKeys } = props;
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const onDeleteKey = useCallback((key: string) => {
    setIsLoading(true);

    return deleteApiKey(key)
      .then(() => {
        toast({
          title: 'API key deleted!',
          description: 'API key has been deleted successfully.',
        });
        startTransition(() => {
          // Refresh the current route and fetch new data from the server without
          // losing client-side browser or React state.
          router.refresh();
        });
      })
      .catch((error: Error) => {
        toast({
          title: 'Uh oh! Something went wrong.',
          description: error?.message || 'Failed to delete API key!',
        });

        Logger.error(error?.message);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  return (
    <div className="block" data-testid='api-keys-table'>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold leading-6">Your API Keys ({ apiKeys.length })</h1>
          <p className="mt-2 text-sm">
            Generate API keys to authenticate requests with <code className="italic">X-API-KEY</code> header
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <GenerateApiKeyButton />
        </div>
      </div>
      <table className="mt-4 w-full whitespace-nowrap text-left table-fixed max-w-[1024px]">
        <colgroup>
          <col className="w-8/12" />
          <col className="w-2/12" />
          <col className="w-2/12" />
        </colgroup>
        <thead className="border-b border-white/10 text-sm leading-6">
          <tr>
            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold sm:pl-0">
              API Key
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold">
              Last Used At
            </th>
            <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold">

            </th>
          </tr>
        </thead>
        <tbody>
          {apiKeys.map((apiKey) => (
            <tr key={apiKey.key}>
              <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium sm:pl-0">{apiKey.key}</td>
              <td className="whitespace-nowrap px-3 py-4 text-sm">{apiKey.lastUsedAt ? formatDistance(apiKey.lastUsedAt, Date.now(), { addSuffix: true }) : 'never'}</td>
              <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button aria-label='Delete' title='Delete' className="p-1 text-red-300 hover:text-red-400">
                      {isLoading ? <RefreshCcw className="animate-spin inline-block mr-2" /> : <TrashIcon className="h-4 w-4" />}
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure to delete this key?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your API key.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => onDeleteKey(apiKey.key)}>Continue</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
