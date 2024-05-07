'use client';

import * as z from 'zod';
import dynamic from 'next/dynamic'
import { useForm, useFieldArray, FormProvider, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@components/ui/button';
import { RefreshCcw, Bug, CircleDot } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import { Logger } from '@lib/logger';
import { useToast } from '@components/ui/use-toast';
import type { OnMount } from '@monaco-editor/react';
import { CODE_DEFAULT_TEMPLATE, FUNCTION_SLUG_REGEX, FunctionSchema } from '@/schemas/function';
import { upsertFunction } from './actions/functions';
import { USERS_API_FUNCTION_URL } from '@lib/constants';
import { SandboxOutput, runCodeSandbox } from './actions/vm';
import { cn } from '@lib/utils';
import { XMarkIcon, PlusIcon } from '@heroicons/react/24/outline';
import { Switch } from "@/components/ui/switch"
import FunctionArgumentInput from '@protected/functions/FunctionArgumentInput';
import { Prisma } from '@prisma/client';

type FunctionFormProps = {
  username: string;
  functionRecord?: Prisma.FunctionGetPayload<{
    include: {
      arguments: true
    }
  }>;
  onSuccess?: () => void;
};

type RunState = {
  isRunning: boolean;
  outputs: SandboxOutput[];
  result: any;
};

const DynamicCodeEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false })

export const FunctionForm: React.FC<FunctionFormProps> = (props) => {
  const { username, functionRecord, onSuccess } = props;
  const editorRef = useRef<Parameters<OnMount> | null>(null);
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [runState, setRunState] = useState<RunState>({
    isRunning: false,
    outputs: [],
    result: null,
  });

  const methods = useForm<z.infer<typeof FunctionSchema>>({
      resolver: zodResolver(FunctionSchema),
      defaultValues: {
        id: functionRecord?.id || '',
        slug: functionRecord?.slug || '',
        code: functionRecord?.code || CODE_DEFAULT_TEMPLATE,
        isPrivate: functionRecord?.isPrivate || true,
        arguments: functionRecord?.arguments ? functionRecord.arguments.map( funcArg => {
          return {
            id: funcArg.id || '',
            defaultValue: funcArg.defaultValue || '',
            description: funcArg.description || '',
            functionId: funcArg.functionId || '',
            isRequired: funcArg.isRequired || false,
            name: funcArg.name || '',
            type: funcArg.type || 'string',
          };
        }) : [],
        httpVerb: functionRecord?.httpVerb || 'GET',
        description: functionRecord?.description || '',
      },
    }),
    { register, control, handleSubmit, watch, setValue, formState: { errors } } = methods;

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'arguments',
  });

  // watch values of slug
  const slug = watch('slug');
  const isSlugValid = FUNCTION_SLUG_REGEX.test(slug);

  const onEditorMount = useCallback<OnMount>((editor, monaco) => {
    editorRef.current = [editor, monaco];
  }, []);

  const onSave = useCallback(async (values: z.infer<typeof FunctionSchema>) => {
    // return console.log({ values })
    setIsSaving(true);

    // save to db and return function
    const savedFunction = await upsertFunction(values)
      .then((resp) => {
        toast({
          title: 'Function updated!',
          description: 'Function has been updated successfully.',
        });

        onSuccess?.();
        return resp.data;
      })
      .catch((error: Error) => {
        toast({
          variant: 'destructive',
          title: 'Uh oh! Something went wrong.',
          description: error?.message || 'Failed to update function!',
        });

        Logger.error(error?.message);
      })
      .finally(() => {
        setIsSaving(false);
      });

    return savedFunction;
  }, []);

  const onRun = useCallback(async () => {
    const [editor, monaco] = editorRef.current || [];

    if (editor && monaco) {
      setRunState({
        isRunning: true,
        outputs: [],
        result: null,
      });

      // execute code
      try {
        const code = editor.getValue();
        const { outputs, result } = await runCodeSandbox(code)
        setRunState({
          isRunning: false,
          outputs,
          result,
        });
      }
      catch (error: any) {
        toast({
          variant: 'destructive',
          title: 'Code execution failed!',
          description: error?.message || 'Failed to update function!',
        });

        setRunState({
          isRunning: false,
          outputs: [],
          result: null,
        });
      }
    }
  }, []);

  const onLogboxClose = useCallback(() => {
    setRunState({
      ...runState,
      outputs: [],
    });
  }, [runState]);

  let functionHitUrl = '';
  if (username && slug && isSlugValid) {
    functionHitUrl = USERS_API_FUNCTION_URL
      .replace(':username', username)
      .replace(':slug', slug);
  }

  const inputClasses = cn('block w-full rounded-md border-0 bg-white/5 py-2 px-2 shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6');

  return (
    <FormProvider { ...methods }>
      <form className="block space-y-6 mt-4 mb-20" method="POST" onSubmit={handleSubmit(onSave)}>
        <div className="block">
          <label htmlFor="slug" className="block text-sm font-medium leading-6">
            Slug
          </label>
          <input
            id="slug"
            {...register('slug')}
            placeholder="hello-world"
            autoComplete="function-code-slug"
            type="text"
            required
            autoFocus
            className={inputClasses}
          />
          {errors.slug && <p className="text-sm font-medium text-destructive-foreground mt-3">{errors.slug.message}</p>}
          {functionHitUrl && !errors.slug && <p className="text-xs font-medium text-muted-foreground mt-3">{functionHitUrl}</p>}
        </div>
        
        <div className="block w-full rounded-md border p-4 shadow bg-black/10">
          <div className="flex justify-between items-center">
            <label className="text-white text-sm font-medium">Arguments</label>
            <button
              type="button"
              onClick={() => append({ functionId: '', name: '', type: 'string', defaultValue: '', description: '', isRequired: false })}
              className="text-white bg-blue-600 hover:bg-blue-700 p-1 rounded"
            >
              <PlusIcon className="h-5 w-5" />
            </button>
          </div>
          {fields.map((item, idx) => (
            <FunctionArgumentInput
              key={item.id}
              index={idx}
              item={item}
              remove={() => remove(idx)}
              className='mt-4'
            />
          ))}
        </div>

        <div className="block space-x-3 space-y-0 rounded-md shadow bg-black/10">
          <Controller
            control={control}
            name='isPrivate'
            render={({ field: { onChange, value, ref } }) => (
              <div className="flex flex-row items-center space-x-3 space-y-0 px-2 py-2">
                <Switch
                  checked={ value }
                  onCheckedChange={ onChange }
                  id={'isPrivate'}
                />
                <div className="space-y-1 leading-none">
                  <label htmlFor="isPrivate" className="block text-sm font-medium">
                    Private mode
                  </label>
                  <p className="text-xs font-medium text-muted-foreground mt-3">
                    Unchecking this will share your function with the world.
                  </p>
                </div>
              </div>
            )}
          />
        </div>

        <div>
          <label className="block text-sm font-medium leading-6">
            Code &#40;Node.js&#41;
          </label>
          <DynamicCodeEditor
            height="40vh"
            defaultLanguage="javascript"
            theme='vs-dark'
            keepCurrentModel={false}
            options={{
              lineNumbers: 'off',
              minimap: { enabled: false },
              fontSize: 12,
              wordWrap: 'on',
            }}
            defaultValue={CODE_DEFAULT_TEMPLATE}
            onMount={onEditorMount}
          />
          {
            runState.outputs.length > 0 && (
              <div id="logbox" className="relative w-full max-h-[240px] overflow-y-auto p-2 text-xs font-mono bg-gray-800 text-gray-100 rounded">
                <button
                  onClick={onLogboxClose} // You will implement this function to handle closing
                  className="absolute top-1 right-1 text-gray-400 hover:text-gray-200"
                  aria-label="Close"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
                <div
                  className="overflow-wrap break-word"
                  style={{ whiteSpace: 'pre-wrap' }}
                >
                  {
                    runState.outputs.map((output, idx) => {
                      const spanClasses = cn({
                        'text-gray-500': output.type === 'log',
                        'text-red-500': output.type === 'error',
                        'text-green-500': output.type === 'output',
                      });
                      return (
                        <div key={`runState-output-${idx}`}>
                          <span className="text-gray-300">[{output.type}]:</span> <span className={spanClasses}>{output.message}</span>
                        </div>
                      );
                    })
                  }
                </div>
              </div>
            )
          }
        </div>
        <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
          <div className="sm:col-span-3"></div>
          <div className="sm:col-span-1 flex justify-end">
            <Button variant={'outline'} type="button" onClick={onRun} disabled={runState.isRunning} className="flex w-full justify-center rounded-md px-3 py-1.5 text-sm font-semibold leading-8 shadow-sm">
              {
                runState.isRunning ?
                  <CircleDot className="animate-spin inline-block mr-2" /> :
                  <Bug className="inline-block mr-2" />
              }
              {runState.isRunning ? 'Running...' : 'Run'}
            </Button>
          </div>
          <div className="sm:col-span-2">
            <Button variant={'default'} type="submit" disabled={isSaving || runState.isRunning} className="flex w-full justify-center rounded-md px-3 py-1.5 text-sm font-semibold leading-8 shadow-sm">
              {isSaving && <RefreshCcw className="animate-spin inline-block mr-2" />}
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      </form>
    </FormProvider>
  );
};
