'use client';
import { useCallback, useState, type FC } from 'react';
import { Logger } from '@repo/shared/lib/logger';
import { BugPlayIcon, CopyPlusIcon, ListChecksIcon } from 'lucide-react';
import type { Prisma } from '@repo/db/prisma';
import { useRouter } from 'next/navigation';
import { cn } from '@repo/shared/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/components/ui/tabs';
import { cloneFunction } from '@repo/shared/actions/functions';
import { APP_AUTH_LOGIN_URL } from '@repo/shared/lib/constants';
import { Button } from '@repo/components/ui/button';
import CodeEditorInput from '@repo/components/CodeEditorInput';
import { useToast } from '@repo/components/ui/use-toast';
import { FormSlideOver } from '@repo/components/slideovers/FormSlideOver';
import { EnvVarsSection } from '@repo/components/data/envVars/EnvVarsSection';
import { EnvVarsOptionalPayload } from '@repo/components/data/envVars/types';
import { UserVarsTable } from '@repo/components/data/envVars/UserVarsTable';
import { CodeSandboxForm } from '@repo/components/data/functions/mine/CodeSandboxForm';
import { ToastAction } from '@repo/components/ui/toast';


type CommunityFunctionReadOnlyViewProps = {
  functionRecord: Prisma.FunctionGetPayload<{
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
  authVars:
    | false
    | {
        userVars: Record<string, any>;
        envVars: EnvVarsOptionalPayload[];
      };
};

export const CommunityFunctionReadOnlyView: FC<CommunityFunctionReadOnlyViewProps> = (props) => {
  const { functionRecord, authVars } = props;
  const router = useRouter();
  const { toast } = useToast();
  const [isSandboxOpen, setSandboxOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const isUserAuthed = authVars !== false;

  const onCancel = useCallback(() => {
    router.back();
  }, []);

  const onClone = useCallback(async () => {
    if (!isUserAuthed) {
      toast({
        variant: 'destructive',
        title: 'Unauthorized',
        description: 'You must be logged in to perform this operation.',
        action: (
          <ToastAction altText="Sign in" onClick={() => router.replace(APP_AUTH_LOGIN_URL + '?redirectTo=' + encodeURIComponent(window.location.href))}>
            Sign in
          </ToastAction>
        ),
      });

      return;
    }

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
          action: (<></>) as React.JSX.Element,
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
  }, [isUserAuthed]);

  return (
    <div className="block min-h-full mt-4" data-testid="function-readonly-view">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="block space-y-6 col-span-1 order-2 lg:order-1 lg:col-span-6 xl:col-span-7 2xl:col-span-8">
          <div className="block">
            <div className="flex mb-3 leading-6 justify-between">
              <label className="block text-sm font-medium">Code &#40;Node.js&#41;</label>
              <div className="relative">
                <button type="button" onClick={onClone} title="Clone this function" className="hover:text-teal-500 flex flex-col">
                  <CopyPlusIcon className="h-5 w-5 ml-2" />
                  <span className="text-xs">Clone</span>
                </button>
              </div>
            </div>
            <CodeEditorInput id="code-editor" value={functionRecord.code} readOnly={true} />
          </div>
          <div className="flex w-full justify-end items-center space-x-4">
            <Button variant={'outline'} type="button" className="flex w-[160px] justify-center rounded-md px-3 py-1.5 text-sm font-semibold leading-8 shadow-sm" onClick={onCancel}>
              Go Back
            </Button>
          </div>
        </div>

        <Tabs id="function-form-tabs" defaultValue="function-tab" className="block col-span-1 order-1 lg:order-2 lg:col-span-6 xl:col-span-5 2xl:col-span-4">
          <div className="flex justify-between mb-4">
            <TabsList className="">
              <TabsTrigger value="function-tab">Function</TabsTrigger>
              <TabsTrigger value="arguments-tab">Arguments</TabsTrigger>
              <TabsTrigger value="vars-tab">Variables</TabsTrigger>
            </TabsList>
            {functionRecord && authVars !== false && (
              <div className="block">
                <Button variant="ghost" type="button" className="flex w-[100px] justify-center rounded-md text-sm font-semibold" onClick={() => setSandboxOpen(true)}>
                  <BugPlayIcon className="inline-block mr-2 h-5" /> Test
                </Button>
              </div>
            )}
          </div>
          <TabsContent value="function-tab" className="block space-y-6">
            <div className="grid grid-cols-12 gap-x-4 gap-y-1">
              <div className="col-span-3 block">
                <label className="block text-sm font-medium leading-6">Method</label>
                <p className="text-sm font-normal text-gray-300 leading-6">{functionRecord.httpVerb}</p>
              </div>
              <div className="col-span-9 block">
                <label className="block text-sm font-medium leading-6">Slug</label>
                <p className="text-sm font-normal text-gray-300 leading-6">{functionRecord.slug}</p>
              </div>
            </div>
            <div className="block">
              <label className="block text-sm font-medium leading-6">Description</label>
              <p className="text-sm font-normal text-gray-300 leading-6">{functionRecord.description}</p>
            </div>
            <div className="block">
              <label className="block text-sm font-medium leading-6">Tags</label>
              <p className="text-sm font-normal text-gray-300 leading-6">{functionRecord.tags.map((elem) => elem.name).join(', ')}</p>
            </div>
          </TabsContent>
          <TabsContent value="arguments-tab" className="block space-y-6">
            <div className="block w-full rounded-md border p-4">
              <div className="flex justify-between items-center">
                <label className="text-white text-sm font-medium">Arguments</label>
              </div>
              <div className="overflow-x-auto mt-4">
                <table className="min-w-full">
                  <thead className="border-b">
                    <tr>
                      <th className="text-left py-3 font-semibold text-sm">Name</th>
                      <th className="text-left py-3 px-2 font-semibold text-sm">Type</th>
                      <th className="text-left py-3 font-semibold text-sm">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {functionRecord.arguments.map((item) => (
                      <tr key={item.id} className="border-b" title={item.defaultValue ? `Default value "${item.defaultValue}"` : 'No default value'}>
                        <td
                          className={cn('py-3 text-sm', {
                            'font-semibold': item.isRequired,
                          })}
                        >
                          {item.isRequired ? '*' : ''}
                          {item.name}
                        </td>
                        <td className="py-3 px-2 text-sm text-amber-500">{item.type}</td>
                        <td className="py-3 text-sm max-w-xs truncate">{item.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>
          {authVars !== false && (
            <TabsContent value="vars-tab" className="block space-y-6">
              <EnvVarsSection envVars={authVars.envVars} />
              <UserVarsTable userVarsRecord={authVars.userVars} />
            </TabsContent>
          )}
        </Tabs>
        {functionRecord && authVars !== false && (
          <FormSlideOver title="Sandbox" open={isSandboxOpen} setOpen={setSandboxOpen}>
            <CodeSandboxForm functionRecord={functionRecord} onClose={() => setSandboxOpen(false)} isMarketplace={true} />
          </FormSlideOver>
        )}
      </div>
    </div>
  );
};
