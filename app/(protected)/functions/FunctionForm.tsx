'use client';

import * as z from 'zod';
import dynamic from 'next/dynamic'
import { useForm, useFieldArray, FormProvider, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@components/ui/button';
import { RefreshCcw } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import { Logger } from '@lib/logger';
import { useToast } from '@components/ui/use-toast';
import type { OnMount } from '@monaco-editor/react';
import { CODE_DEFAULT_TEMPLATE, FUNCTION_SLUG_REGEX, FunctionSchema, MAX_FUNCTION_DESCRIPTION_LENGTH } from '@/schemas/function';
import { upsertFunction } from './actions/functions';
import { USERS_API_FUNCTION_URL } from '@lib/constants';
import { cn } from '@lib/utils';
import { PlusIcon } from '@heroicons/react/24/outline';
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
  onCancel?: () => void;
};

const DynamicCodeEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false })

export const FunctionForm: React.FC<FunctionFormProps> = (props) => {
  const {
    username,
    functionRecord,
    onSuccess,
    onCancel = () => void 0
  } = props;
  const isEditMode = !!functionRecord;
  const editorRef = useRef<Parameters<OnMount> | null>(null);
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const methods = useForm<z.infer<typeof FunctionSchema>>({
    resolver: zodResolver(FunctionSchema),
    defaultValues: {
      id: functionRecord?.id || '',
      slug: functionRecord?.slug || '',
      description: functionRecord?.description || '',
      code: functionRecord?.code || CODE_DEFAULT_TEMPLATE,
      isPrivate: functionRecord?.isPrivate || true,
      arguments: functionRecord?.arguments ? functionRecord.arguments.map(funcArg => {
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
      httpVerb: functionRecord?.httpVerb || 'GET'
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
    setIsSaving(true);

    // save to db and return function
    const savedFunction = await upsertFunction(values)
      .then((resp) => {
        toast({
          title: isEditMode ? 'Function updated!' : 'Function created!',
          description: isEditMode ? 'Your function has been updated.' : 'Your function has been created.',
        });

        onSuccess?.();
        return resp.data;
      })
      .catch((error: Error) => {
        toast({
          variant: 'destructive',
          title: 'Uh oh! Something went wrong.',
          description: error?.message || 'Failed to perform operation!',
        });

        Logger.error(error?.message);
      })
      .finally(() => {
        setIsSaving(false);
      });

    return savedFunction;
  }, [isEditMode]);

  let functionHitUrl = '';
  if (username && slug && isSlugValid) {
    functionHitUrl = USERS_API_FUNCTION_URL
      .replace(':username', username)
      .replace(':slug', slug);
  }

  const inputClasses = cn('block w-full rounded-md border-0 bg-white/5 py-2 px-2 shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6');

  return (
    <FormProvider {...methods}>
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
        <div className="block">
          <textarea
            {...register(`description`)}
            placeholder="A function to output 'hello world!' text."
            rows={3}
            className={`col-span-12 text-sm ${inputClasses}`}
          />
          <div className='col-span-12 grid grid-cols-12 mt-3'>
            <div className='col-span-8 text-left'>
              {errors.description && <p className="text-sm font-medium text-destructive-foreground mt-3">{errors.description.message}</p>}
            </div>
            <div className='col-span-4 text-right'>
              <p className="text-xs text-muted-foreground">{`${watch(`description`)?.length || 0}/${MAX_FUNCTION_DESCRIPTION_LENGTH} characters`}</p>
            </div>
          </div>
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
        </div>
        <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
          <div className="sm:col-span-4">

            <div className="block space-x-3 space-y-0 rounded-md shadow bg-black/10">
              <Controller
                control={control}
                name='isPrivate'
                render={({ field: { onChange, value, ref } }) => (
                  <div className="flex flex-row items-center space-x-3 space-y-0 px-2 py-2">
                    <Switch
                      checked={value}
                      onCheckedChange={onChange}
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
          </div>
          <div className="sm:col-span-1 flex items-center">
            <Button variant={'outline'} type="button" disabled={isSaving} className="flex w-full justify-center rounded-md px-3 py-1.5 text-sm font-semibold leading-8 shadow-sm" onClick={onCancel}>
              Cancel
            </Button>
          </div>
          <div className="sm:col-span-1 flex items-center">
            <Button variant={'default'} type="submit" disabled={isSaving} className="flex w-full justify-center rounded-md px-3 py-1.5 text-sm font-semibold leading-8 shadow-sm">
              {isSaving && <RefreshCcw className="animate-spin inline-block mr-2" />}
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      </form>
    </FormProvider>
  );
};
