'use client';

import { Logger } from '@lib/logger';
import { useToast } from '@components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { TooltipTrigger, TooltipContent, Tooltip, TooltipProvider } from '@/components/ui/tooltip';
import { AuthSessionResponse } from '@app/auth/session';
import { PhraseCode, type Profile } from '@prisma/client';
import { useCallback, useState } from 'react';
import { updatePhraseCode } from '../actions/phraseCode';
import { RefreshCcw } from 'lucide-react';
import { ClipboardDocumentIcon } from '@heroicons/react/20/solid';
import { cn } from '@lib/utils';

type ApiKeyFormProps = {
  authSession: AuthSessionResponse;
};

export const ApiKeyForm: React.FC<ApiKeyFormProps> = (props) => {
  const { authSession } = props;
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [phraseCode, setPhraseCode] = useState<Pick<PhraseCode, 'code' | 'expiresAt'>>({
    code: authSession.user.phraseCode?.code || '',
    expiresAt: authSession.user.phraseCode?.expiresAt || new Date(),
  });

  const copyToClipboard = useCallback(() => {
    if (phraseCode.code) {
      navigator.clipboard.writeText(phraseCode.code);
      toast({
        title: 'Copied to clipboard!',
        description: 'Phrase code has been copied to clipboard.',
      });
    }
  }, [phraseCode.code]);

  const onSubmit = useCallback(() => {
    setIsLoading(true);

    return updatePhraseCode()
      .then(({ data }) => {
        setPhraseCode(data);
        toast({
          title: 'New phrase code generated!',
          description: 'A new phrase code has been generated successfully.',
        });
      })
      .catch((error: Error) => {
        toast({
          title: 'Uh oh! Something went wrong.',
          description: error?.message || 'Failed to generate phrase code!',
        });

        Logger.error(error?.message);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const isPhraseCodeExpired = phraseCode.code && new Date(phraseCode.expiresAt) < new Date();

  return (
    <div className="w-full" data-testid="phrase-code-form">
      <h3 className="text-lg font-semibold text-white mb-4">Phrase Code</h3>
      <p className="mt-5 mb-3 font-semibold text-sm leading-5 text-gray-500">Note: Within your active session, the phrase code can be reused for continuous access until a new one is generated.</p>

      <div className="border-l-2 pl-4 border-white/20 hover:border-white/50">
        {phraseCode.code ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="link" className="text-sm text-gray-400 mb-2 px-0 m-0" onClick={copyToClipboard}>
                  <p className="text-sm text-gray-400 m-0 leading-10">{phraseCode.code}</p>
                  <ClipboardDocumentIcon className={cn('ml-2 h-6 w-6')} aria-hidden="true" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Click to copy</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <span className="text-sm text-gray-400 mb-2">No phrase code generated</span>
        )}
      </div>
      {isPhraseCodeExpired && (
        <>
          <p className="text-xs text-red-300 leading-5 mt-3">Your phrase code has expired. You may generate a new one, or leave it expired until you need to re-authenticate with GPT.</p>
        </>
      )}

      <div className="mt-8 flex">
        <Button
          variant={'default'}
          type="button"
          onClick={onSubmit}
          disabled={isLoading}
          className="rounded-md bg-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
        >
          {isLoading && <RefreshCcw className="animate-spin inline-block mr-2" />}
          {isLoading ? 'Generating...' : 'Generate'}
        </Button>
      </div>
    </div>
  );
};
