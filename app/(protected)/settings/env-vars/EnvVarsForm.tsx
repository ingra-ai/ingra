'use client';

import type { FC } from 'react';
import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@components/ui/button';
import { RefreshCcw } from 'lucide-react';
import { useCallback, useState } from 'react';
import { Logger } from '@lib/logger';
import { useToast } from '@components/ui/use-toast';
import { EnvVarsSchema } from '@/schemas/envVars';
import { upsertEnvVar } from '@actions/envVars';
import { Input } from '@components/ui/input';
import { EnvVarsOptionalPayload } from './types';

type EnvVarFormProps = {
  onSuccess?: () => void;
  envVarRecord?: EnvVarsOptionalPayload;
};

export const EnvVarForm: FC<EnvVarFormProps> = (props) => {
  const { onSuccess, envVarRecord } = props;
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const isEditMode = !!envVarRecord;

  const { handleSubmit, register, formState, reset } = useForm<z.infer<typeof EnvVarsSchema>>({
    resolver: zodResolver(EnvVarsSchema),
    defaultValues: {
      id: envVarRecord?.id || 0,
      key: envVarRecord?.key || '',
      value: envVarRecord?.value || ''
    },
  });

  const onSubmit = useCallback((values: z.infer<typeof EnvVarsSchema>) => {
    setIsLoading(true);
    return upsertEnvVar(values)
      .then((result) => {
        if ( result.status !== 'ok' ) {
          throw new Error(result.message);
        }

        toast({
          title: 'Environment variable created!',
          description: 'Environment variable has been created successfully.',
        });

        reset();

        if (typeof onSuccess === 'function') {
          onSuccess();
        }
      })
      .catch((error: Error) => {
        toast({
          title: 'Uh oh! Something went wrong.',
          description: error?.message || 'Failed to perform environment variable operation',
        });

        Logger.error(error?.message);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  return (
    <form className="block space-y-6 mt-10" method="POST" onSubmit={handleSubmit(onSubmit)}>
      <h1>
        {
          isEditMode ? 'Edit Environment Variable' : 'Add Environment Variable'
        }
      </h1>
      <div>
        <label htmlFor="key" className="block text-sm font-medium leading-6">
          Key
        </label>
        <Input
          id="key"
          {...register('key')}
          placeholder="Enter a key"
          type="text"
          autoComplete="key"
          disabled={isEditMode}
          required
          autoFocus
        />
        {formState.errors.key && <p className="text-sm font-medium text-destructive-foreground mt-3 text-left">{formState.errors.key.message}</p>}
      </div>
      <div>
        <label htmlFor="value" className="block text-sm font-medium leading-6">
          Value
        </label>
        <Input
          id="value"
          {...register('value')}
          placeholder="Enter a value"
          autoComplete=""
          required
        />
        {formState.errors.value && <p className="text-sm font-medium text-destructive-foreground mt-3 text-left">{formState.errors.value.message}</p>}
      </div>

      <div className="grid py-8 grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
        <div className="sm:col-span-2"></div>
        <div className="sm:col-span-2"></div>
        <div className="sm:col-span-2">
          <Button variant={'default'} type="submit" disabled={isLoading} className="flex w-full justify-center rounded-md px-3 py-1.5 text-sm font-semibold leading-8 shadow-sm">
            {isLoading && <RefreshCcw className="animate-spin inline-block mr-2" />}
            {isLoading ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>
    </form>
  );
};
