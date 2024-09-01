'use client';

import type { FC } from 'react';
import { useCallback, useState, useTransition } from 'react';
import { useToast } from '@repo/components/ui/use-toast';
import { Button } from '@repo/components/ui/button';
import { RefreshCcw } from 'lucide-react';
import { generateApiKey } from '@repo/shared/actions/apiKey';
import { useRouter } from 'next/navigation';

type GenerateApiKeyButtonProps = {
  noop?: any;
};

export const GenerateApiKeyButton: FC<GenerateApiKeyButtonProps> = (props) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const onSubmit = useCallback(() => {
    setIsLoading(true);

    return generateApiKey()
      .then((result) => {
        if (result.status !== 'ok') {
          throw new Error(result.message);
        }

        toast({
          title: 'New API key generated!',
          description: 'A new API key has been generated successfully.',
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
          description: error?.message || 'Failed to generate API key!',
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  return (
    <div className="w-full" data-testid="generate-api-key-button">
      <div className="mt-8 flex">
        <Button
          variant={'default'}
          type="button"
          onClick={onSubmit}
          disabled={isLoading}
          className="rounded-md bg-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
        >
          {isLoading && <RefreshCcw className="animate-spin inline-block mr-2" />}
          {isLoading ? 'Generating...' : 'Generate New API Key'}
        </Button>
      </div>
    </div>
  );
};
