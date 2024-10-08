'use client';

import * as z from 'zod';
import { startTransition, useCallback, useState, type JSX, type FC } from 'react';
import { useForm, useFieldArray, FormProvider, Controller } from 'react-hook-form';
import type { Prisma } from '@repo/db/prisma';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '../../../ui/button';
import { RefreshCcw, BugPlayIcon, CopyPlusIcon, ListChecksIcon } from 'lucide-react';
import { Logger } from '@repo/shared/lib/logger';
import { useToast } from '../../../ui/use-toast';
import { FunctionSchema, HttpVerbEnum, MAX_FUNCTION_DESCRIPTION_LENGTH } from '@repo/shared/schemas/function';
import { cloneFunction, collectionToggleFunction, upsertFunction } from '@repo/shared/actions/functions';
import { PlusIcon } from '@heroicons/react/24/outline';
import { Switch } from '../../../ui/switch';
import FunctionArgumentFormField from './FunctionArgumentFormField';
import CodeEditorInput from '../../../CodeEditorInput';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../ui/tabs';
import { useRouter } from 'next/navigation';
import { CodeSandboxForm } from './CodeSandboxForm';
import { TagField } from '../../../TagField';
import { Input } from '../../../ui/input';
import { Textarea } from '../../../ui/textarea';
import { ToastAction } from '../../../ui/toast';
import type { EnvVarsOptionalPayload } from '../../../data/envVars/types';
import { generateCodeDefaultTemplate } from '@repo/shared/utils/vm/functions/generateCodeDefaultTemplate';
import { FormSlideOver } from '../../../slideovers/FormSlideOver';
import { getUserRepoFunctionsUri, getUserRepoFunctionsEditUri } from '@repo/shared/lib/constants/repo';
import ToggleCollectionMenuButton from '../../../data/collections/mine/ToggleCollectionMenuButton';
import type { MineCollectionMenuListGetPayload } from '../../../data/collections/mine/types';

type FunctionFormProps = {
  ownerUsername: string;
  userVars: Record<string, any>;
  envVars: EnvVarsOptionalPayload[];
  functionRecord?: Prisma.FunctionGetPayload<{
    include: {
      owner: {
        select: {
          profile: {
            select: {
              userName: true;
            };
          };
        };
      };
      tags: true;
      arguments: true;
    };
  }>;
  collections?: MineCollectionMenuListGetPayload[];
};

export const FunctionForm: FC<FunctionFormProps> = (props) => {
  const { ownerUsername = '', userVars = {}, envVars = [], functionRecord, collections = [] } = props;
  const isEditMode = !!functionRecord && !!functionRecord.id;
  const { toast } = useToast();
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [isSandboxOpen, setSandboxOpen] = useState(false);
  const allUserAndEnvKeys = Object.keys(userVars).concat(envVars.map((envVar) => envVar.key));
  const methods = useForm<z.infer<typeof FunctionSchema>>({
      reValidateMode: 'onSubmit',
      resolver: zodResolver(FunctionSchema),
      defaultValues: {
        id: functionRecord?.id || '',
        slug: functionRecord?.slug || '',
        description: functionRecord?.description || '',
        code: functionRecord?.code || generateCodeDefaultTemplate(allUserAndEnvKeys),
        isPrivate: typeof functionRecord?.isPrivate === 'undefined' ? true : !!functionRecord?.isPrivate,
        isPublished: typeof functionRecord?.isPublished === 'undefined' ? false : !!functionRecord?.isPublished,
        tags: functionRecord?.tags
          ? functionRecord.tags.map((tag) => {
              return {
                id: tag.id || '',
                functionId: tag.functionId || '',
                name: tag.name || '',
              };
            })
          : [],
        arguments: functionRecord?.arguments
          ? functionRecord.arguments.map((funcArg) => {
              return {
                id: funcArg.id || '',
                defaultValue: funcArg.defaultValue || '',
                description: funcArg.description || '',
                functionId: funcArg.functionId || '',
                isRequired: funcArg.isRequired || false,
                name: funcArg.name || '',
                type: funcArg.type || 'string',
              };
            })
          : [],
        httpVerb: functionRecord?.httpVerb || 'GET',
      },
    }),
    {
      register,
      control,
      handleSubmit,
      watch,
      formState: { errors },
    } = methods;

  const {
    fields: argFields,
    append: argAppend,
    remove: argRemove,
  } = useFieldArray({
    control,
    name: 'arguments',
  });

  const {
    fields: tagFields,
    append: handleAddTag,
    remove: handleRemoveTag,
  } = useFieldArray({
    control,
    name: 'tags',
  });

  const onCancel = useCallback(() => {
    router.replace(getUserRepoFunctionsUri(ownerUsername));
  }, [ownerUsername]);

  const onSave = useCallback(
    async (values: z.infer<typeof FunctionSchema>) => {
      setIsSaving(true);

      // save to db and return function
      const savedFunction = await upsertFunction(values)
        .then((resp) => {
          let redirectUrl = '';

          if (resp?.data?.id) {
            if (isEditMode) {
              // If user is editing, stay on the same page but gives option to go back to functions list.
              toast({
                title: 'Function updated!',
                description: 'Your function has been updated.',
                action: (
                  <ToastAction altText="My Functions" onClick={() => router.replace(getUserRepoFunctionsUri(ownerUsername))}>
                    <ListChecksIcon className="w-3 h-3 mr-3" /> My Functions
                  </ToastAction>
                ),
              });
            } else {
              toast({
                title: 'Function created!',
                description: 'Your function has been created.',
              });
            }
          }

          startTransition(() => {
            // Go to the created functions
            redirectUrl = getUserRepoFunctionsEditUri(ownerUsername, resp.data.slug);
            
            if (redirectUrl) {
              router.push(redirectUrl);
            } else {
              router.refresh();
            }
          });

          return resp;
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
    },
    [isEditMode, ownerUsername]
  );

  const onClone = useCallback(async () => {
    if (!isEditMode) return;

    const functionId = functionRecord?.id;

    setIsSaving(true);

    const clonedFunction = await cloneFunction(functionId)
      .then((result) => {
        if (result.status !== 'ok') {
          throw new Error(result.message);
        }

        const toastProps = {
          title: 'Function cloned!',
          description: 'Your function has been cloned.',
          action: (<></>) as JSX.Element,
        };

        const functionHref = result?.data?.href;

        if (functionHref) {
          toastProps.action = (
            <ToastAction altText="Cloned Function" onClick={() => router.replace(functionHref)}>
              <ListChecksIcon className="w-3 h-3 mr-3" /> Cloned Function
            </ToastAction>
          );
        }

        toast(toastProps);
        router.refresh();
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

    return clonedFunction;
  }, [isEditMode, ownerUsername]);

  const onFunctionCollectionToggleChanged = (collectionId: string, functionId: string, checked: boolean) => {
    const action = checked ? 'add' : 'remove';

    collectionToggleFunction(collectionId, functionId, action)
      .then((result) => {
        if (result.status !== 'ok') {
          throw new Error(result.message);
        }

        toast({
          title: 'Success!',
          description: result.message,
        });

        router.refresh();
      })
      .catch((error) => {
        toast({
          variant: 'destructive',
          title: 'Uh oh! Something went wrong.',
          description: error?.message || 'Failed to handling collection!',
        });
      });
  };

  return (
    <div className="block min-h-full mt-4" data-testid="function-form">
      <FormProvider {...methods}>
        <form className="grid grid-cols-1 lg:grid-cols-12 gap-8" method="POST" onSubmit={handleSubmit(onSave)}>
          <div className="block space-y-6 col-span-1 order-2 lg:order-1 md:col-span-6 xl:col-span-7 2xl:col-span-8">
            <div className="block">
              <div className="flex mb-3 leading-6 justify-between">
                <label className="block text-sm font-medium">Code &#40;Node.js&#41;</label>
                {isEditMode && (
                  <div className="relative flex items-center">
                    {collections.length > 0 && functionRecord?.id && (
                      <ToggleCollectionMenuButton functionId={functionRecord.id || ''} collections={collections} onCheckedChange={onFunctionCollectionToggleChanged} className="p-2 bg-card mx-4" iconClassName="h-5 w-5" />
                    )}
                    <button type="button" onClick={onClone} title="Clone this function" className="hover:text-teal-500 flex flex-col">
                      <CopyPlusIcon className="h-5 w-5 ml-2" />
                    </button>
                  </div>
                )}
              </div>
              <Controller control={control} name={'code'} render={({ field }) => <CodeEditorInput id="code-editor" onChange={field.onChange} value={field.value} />} />
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

          <Tabs id="function-form-tabs" defaultValue="function-properties-tab" className="block col-span-1 order-1 lg:order-2 lg:col-span-6 xl:col-span-5 2xl:col-span-4">
            <div className="flex justify-between mb-4">
              <TabsList className="">
                <TabsTrigger value="function-properties-tab">Properties</TabsTrigger>
                <TabsTrigger value="arguments-tab">Arguments</TabsTrigger>
              </TabsList>
              {functionRecord && (
                <div className="block">
                  <Button variant="accent" type="button" disabled={isSaving} className="flex justify-center rounded-md text-sm font-semibold" onClick={() => setSandboxOpen(true)}>
                    <BugPlayIcon className="inline-block mr-2 w-4 h-4" /> Dry Run
                  </Button>
                </div>
              )}
            </div>
            <TabsContent value="function-properties-tab" className="block space-y-6">
              <div className="grid grid-cols-12 gap-x-4 gap-y-1">
                <div className="col-span-3 block">
                  <label htmlFor="httpVerb" className="block text-sm font-medium leading-6">
                    Method
                  </label>
                  <Controller
                    control={control}
                    name="httpVerb"
                    render={({ field: { onChange, value, ref } }) => (
                      <Select onValueChange={onChange} defaultValue={value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select method" />
                        </SelectTrigger>
                        <SelectContent>
                          {HttpVerbEnum.options.map((verb, idx) => (
                            <SelectItem key={`http-verb-${idx}`} value={verb}>
                              {verb}
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
                  <Input id="slug" {...register('slug')} placeholder="hello-world" aria-autocomplete="none" autoComplete="" type="text" required autoFocus />
                  {errors.slug && <p className="text-sm font-medium text-destructive-foreground mt-3">{errors.slug.message}</p>}
                </div>
              </div>
              <div className="block space-y-2">
                <label htmlFor="description" className="block text-sm font-medium leading-6">
                  Description
                </label>
                <Textarea {...register(`description`)} placeholder="A function to output 'hello world!' text." rows={3} className={`col-span-12 text-sm`} />
                <div className="col-span-12 grid grid-cols-12 mt-3">
                  <div className="col-span-8 text-left">{errors.description && <p className="text-sm font-medium text-destructive-foreground mt-3">{errors.description.message}</p>}</div>
                  <div className="col-span-4 text-right">
                    <p className="text-xs text-muted-foreground">{`${watch(`description`)?.length || 0}/${MAX_FUNCTION_DESCRIPTION_LENGTH} characters`}</p>
                  </div>
                </div>
              </div>

              <div className="block space-y-2">
                <label htmlFor="tags" className="block text-sm font-medium leading-6">
                  Tags
                </label>
                <TagField id="tags" tags={tagFields.map((tag) => tag.name)} addTag={(tag) => handleAddTag({ functionId: '', name: tag })} removeTag={(tag, idx) => handleRemoveTag(idx)} maxTags={5} />
                {errors.tags?.[0]?.name && <p className="text-sm font-medium text-destructive-foreground mt-3">{errors.tags?.[0]?.name.message}</p>}
              </div>

              <div className="block space-y-2">
                <Controller
                  control={control}
                  name="isPublished"
                  render={({ field: { onChange, value, ref } }) => {
                    return (
                      <div className="flex flex-row items-center space-x-3 space-y-0 px-2 py-2">
                        <div className="flex flex-col w-full space-y-1 leading-none">
                          <label htmlFor="isPublished" className="block text-sm font-medium">
                            Publish
                          </label>
                          <p className="text-xs font-medium text-muted-foreground mt-3">
                            Toggle this option to publish or unpublish the function. Published functions are available for use, while unpublished functions remain in draft mode and are not accessible.
                          </p>
                        </div>
                        <div className="flex justify-end">
                          <Switch checked={value} onCheckedChange={onChange} id={'isPublished'} />
                        </div>
                      </div>
                    );
                  }}
                />
              </div>

              <div className="block">
                <Controller
                  control={control}
                  name="isPrivate"
                  render={({ field: { onChange, value, ref } }) => {
                    return (
                      <div className="flex flex-row items-center space-x-3 space-y-0 px-2 py-2">
                        <div className="flex flex-col w-full space-y-1 leading-none">
                          <label htmlFor="isPrivate" className="block text-sm font-medium">
                            Private mode
                          </label>
                          <p className="text-xs font-medium text-muted-foreground mt-3">Unchecking this will share your function to Marketplace. Only works for published functions.</p>
                        </div>
                        <div className="flex justify-end">
                          <Switch checked={value} onCheckedChange={onChange} id={'isPrivate'} />
                        </div>
                      </div>
                    );
                  }}
                />
              </div>
            </TabsContent>
            <TabsContent value="arguments-tab" className="block space-y-6">
              <div className="block w-full rounded-md border p-4">
                <div className="flex justify-between items-center">
                  <label className="text-white text-sm font-medium">Arguments</label>
                  <button
                    type="button"
                    onClick={() =>
                      argAppend({
                        functionId: '',
                        name: '',
                        type: 'string',
                        defaultValue: '',
                        description: '',
                        isRequired: false,
                      })
                    }
                    className="text-white bg-blue-600 hover:bg-blue-700 p-1 rounded"
                  >
                    <PlusIcon className="h-5 w-5" />
                    <span className="sr-only">Add a new argument</span>
                  </button>
                </div>
                {argFields.map((item, idx) => (
                  <FunctionArgumentFormField key={item.id} index={idx} item={item} remove={() => argRemove(idx)} className="mt-4" />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </form>
      </FormProvider>
      {functionRecord && (
        <FormSlideOver title="Sandbox" open={isSandboxOpen} setOpen={setSandboxOpen}>
          <CodeSandboxForm functionRecord={functionRecord} onClose={() => setSandboxOpen(false)} />
        </FormSlideOver>
      )}
    </div>
  );
};
