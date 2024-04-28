'use client';

import { useCallback, useState, useTransition } from 'react';
import { Logger } from '@lib/logger';
import { useToast } from '@components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { RefreshCcw } from 'lucide-react';
import { deleteApiKey } from '@protected/settings/actions/apiKey';
import { useRouter } from 'next/navigation';
import formatDistance from 'date-fns/formatDistance';
import type { ApiKey } from '@prisma/client';

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
    <div className="mt-7" data-testid='api-keys-table'>
      <h2 className="text-base font-semibold leading-7 text-white">Your API Keys</h2>
      <table className="mt-4 w-full whitespace-nowrap text-left table-fixed max-w-[1024px]">
        <colgroup>
          <col className="w-8/12" />
          <col className="w-2/12" />
          <col className="w-2/12" />
        </colgroup>
        <thead className="border-b border-white/10 text-sm leading-6">
          <tr>
            <th scope="col" className="p-3 font-semibold">
              Key
            </th>
            <th scope="col" className="p-3 font-semibold">
              Last Used At
            </th>
            <th scope="col" className="p-3 pr-5 font-semibold text-right">
              
            </th>
          </tr>
        </thead>
        <tbody>
          {apiKeys.map((apiKey) => (
            <tr key={apiKey.key}>
              <td className="p-3 font-normal">{apiKey.key}</td>
              <td className="p-3 font-normal">{apiKey.lastUsedAt ? formatDistance(apiKey.lastUsedAt, Date.now(), { addSuffix: true }) : 'never'}</td>
              <td className="p-3 pr-5 font-normal text-right">
                <Button
                  variant={'destructive'}
                  type="button"
                  onClick={() => onDeleteKey(apiKey.key)}
                  disabled={isLoading}
                >
                  {isLoading && <RefreshCcw className="animate-spin inline-block mr-2" />}
                  {isLoading ? 'Deleting...' : 'Delete'}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
