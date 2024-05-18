'use client';

import * as z from 'zod';
import { useForm, useFieldArray, FormProvider, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@components/ui/button';
import { RefreshCcw, BugPlayIcon } from 'lucide-react';
import { useCallback, useState } from 'react';
import { Logger } from '@lib/logger';
import { useToast } from '@components/ui/use-toast';
import { CODE_DEFAULT_TEMPLATE, FUNCTION_SLUG_REGEX, FunctionSchema, HttpVerbEnum, MAX_FUNCTION_DESCRIPTION_LENGTH } from '@/schemas/function';
import { upsertFunction } from './actions/functions';
import { USERS_API_FUNCTION_URL } from '@lib/constants';
import { cn } from '@lib/utils';
import { PlusIcon } from '@heroicons/react/24/outline';
import { Switch } from "@/components/ui/switch"
import FunctionArgumentFormField from '@protected/functions/FunctionArgumentFormField';
import type { Prisma } from '@prisma/client';
import CodeEditorInput from '@/components/CodeEditorInput';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useRouter } from 'next/navigation';
import { FormSlideOver } from '@components/slideovers/FormSlideOver';
import { CodeSandboxForm } from './CodeSandboxForm';

type FunctionFormProps = {
  username: string;
  functionRecord?: Prisma.FunctionGetPayload<{
    include: {
      arguments: true
    }
  }>;
};

export const FunctionForm: React.FC<FunctionFormProps> = (props) => {
  const {
    username,
    functionRecord
  } = props;
  const isEditMode = !!functionRecord;
  const { toast } = useToast();
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [isSandboxOpen, setSandboxOpen] = useState(false);
  const methods = useForm<z.infer<typeof FunctionSchema>>({
    reValidateMode: 'onSubmit',
    resolver: zodResolver(FunctionSchema),
    defaultValues: {
      id: functionRecord?.id || '',
      slug: functionRecord?.slug || '',
      description: functionRecord?.description || '',
      code: functionRecord?.code || CODE_DEFAULT_TEMPLATE,
      isPrivate: !!functionRecord?.isPrivate,
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
    { register, control, handleSubmit, watch, formState: { errors } } = methods;

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'arguments',
  });

  // watch values of slug
  const slug = watch('slug');
  const isSlugValid = FUNCTION_SLUG_REGEX.test(slug);

  const onCancel = useCallback(() => {
    router.replace('/functions/list');
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

        if (!isEditMode && resp?.data?.id) {
          router.replace(`/functions/edit/${resp.data.id}`);
        }
        else {
          router.refresh();
        }
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
    <div className="block min-h-full mt-4" data-testid="function-form">
      <FormProvider {...methods}>
        <form className="grid grid-cols-1 md:grid-cols-12 gap-8" method="POST" onSubmit={handleSubmit(onSave)}>
          <div className="block space-y-6 col-span-1 order-2 lg:order-1 lg:col-span-6 xl:col-span-7 2xl:col-span-8">
            <div className="block">
              <label className="block text-sm font-medium leading-6 mb-4 text-right">
                Code &#40;Node.js&#41;
              </label>
              <Controller
                control={control}
                name={'code'}
                render={({ field }) => (
                  <CodeEditorInput id='code-editor' onChange={field.onChange} value={field.value} />
                )}
              />
              {errors.code && <p className="text-sm font-medium text-destructive-foreground mt-3">{errors.code.message}</p>}
            </div>
            <div className="flex w-full justify-end items-center space-x-4">
              <Button variant={'destructive'} type="button" disabled={isSaving} className="flex w-[160px] justify-center rounded-md px-3 py-1.5 text-sm font-semibold leading-8 shadow-sm" onClick={onCancel}>
                Cancel
              </Button>
              <Button variant={'default'} type="submit" disabled={isSaving} className="flex w-[160px] justify-center rounded-md px-3 py-1.5 text-sm font-semibold leading-8 shadow-sm">
                {isSaving && <RefreshCcw className="animate-spin inline-block mr-2" />}
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>

          <Tabs id="function-form-tabs" defaultValue="function-tab" className="col-span-1 order-1 lg:order-2 lg:col-span-6 xl:col-span-5 2xl:col-span-4">
            <div className="flex justify-between mb-4">
              <TabsList className="">
                <TabsTrigger value="function-tab">Function</TabsTrigger>
                <TabsTrigger value="arguments-tab">Arguments</TabsTrigger>
              </TabsList>
              {
                functionRecord && (
                  <div className="block">
                    <Button variant='ghost' type="button" disabled={isSaving} className="flex w-[100px] justify-center rounded-md text-sm font-semibold" onClick={() => setSandboxOpen(true)}>
                      <BugPlayIcon className="inline-block mr-2 h-5" /> Test
                    </Button>
                  </div>
                )
              }
            </div>
            <TabsContent value="function-tab" className='block space-y-6'>
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-3 block">
                  <label htmlFor="httpVerb" className="block text-sm font-medium leading-6">
                    Method
                  </label>
                  <Controller
                    control={control}
                    name='httpVerb'
                    render={({ field: { onChange, value, ref } }) => (
                      <Select
                        onValueChange={onChange}
                        defaultValue={value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select method" />
                        </SelectTrigger>
                        <SelectContent>
                          {HttpVerbEnum.options.map((verb, idx) => (
                            <SelectItem key={`http-verb-${idx}`} value={verb}>
                              { verb }
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                    )}
                  />
                  {errors.httpVerb && <p className="text-sm font-medium text-destructive-foreground mt-3">{errors.httpVerb.message}</p>}
                </div>
                <div className="col-span-9 block">
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

              <div className="block space-x-3 space-y-0 rounded-md shadow bg-black/10">
                <Controller
                  control={control}
                  name='isPrivate'
                  render={({ field: { onChange, value, ref } }) => {
                    return (
                      <div className="flex flex-row items-center space-x-3 space-y-0 px-2 py-2">
                        <div className="flex flex-col w-full space-y-1 leading-none">
                          <label htmlFor="isPrivate" className="block text-sm font-medium">
                            Private mode
                          </label>
                          <p className="text-xs font-medium text-muted-foreground mt-3">
                            Unchecking this will share your function with the world.
                          </p>
                        </div>
                        <div className="flex justify-end">
                          <Switch
                            checked={value}
                            onCheckedChange={onChange}
                            id={'isPrivate'}
                          />
                        </div>
                      </div>
                    );
                  }}
                />
              </div>
            </TabsContent>
            <TabsContent value="arguments-tab" className='block space-y-6'>
              <div className="block w-full rounded-md border p-4 shadow bg-black/10">
                <div className="flex justify-between items-center">
                  <label className="text-white text-sm font-medium">Arguments</label>
                  <button
                    type="button"
                    onClick={() => append({ functionId: '', name: '', type: 'string', defaultValue: '', description: '', isRequired: false })}
                    className="text-white bg-blue-600 hover:bg-blue-700 p-1 rounded"
                  >
                    <PlusIcon className="h-5 w-5" />
                    <span className="sr-only">Add a new argument</span>
                  </button>
                </div>
                {fields.map((item, idx) => (
                  <FunctionArgumentFormField
                    key={item.id}
                    index={idx}
                    item={item}
                    remove={() => remove(idx)}
                    className='mt-4'
                  />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </form>
      </FormProvider>
      {
        functionRecord && (
          <FormSlideOver title="Sandbox" open={isSandboxOpen} setOpen={setSandboxOpen}>
            <CodeSandboxForm functionRecord={functionRecord} onClose={() => setSandboxOpen(false)} />
          </FormSlideOver>
        )
      }
    </div>
  );
};
