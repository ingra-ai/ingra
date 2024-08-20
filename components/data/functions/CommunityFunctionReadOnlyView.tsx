'use client';
import { useCallback, useState, type FC } from 'react';
import { Button } from '@components/ui/button';
import { BugPlayIcon } from 'lucide-react';
import type { Prisma } from '@prisma/client';
import CodeEditorInput from '@/components/CodeEditorInput';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useRouter } from 'next/navigation';
import { FormSlideOver } from '@components/slideovers/FormSlideOver';
import { CodeSandboxForm } from '@protected/mine/functions/CodeSandboxForm';
import { EnvVarsSection } from '@protected/settings/env-vars/EnvVarsSection';
import { EnvVarsOptionalPayload } from '@protected/settings/env-vars/types';
import { UserVarsTable } from '@protected/mine/functions/UserVarsTable';
import { cn } from '@lib/utils';

type CommunityFunctionReadOnlyViewProps = {
  functionRecord: Prisma.FunctionGetPayload<{
    include: {
      tags: true,
      arguments: true
    }
  }>;
  authVars: false | {
    userVars: Record<string, any>;
    envVars: EnvVarsOptionalPayload[];
  };
};

export const CommunityFunctionReadOnlyView: FC<CommunityFunctionReadOnlyViewProps> = (props) => {
  const {
    functionRecord,
    authVars
  } = props;
  const router = useRouter();
  const [isSandboxOpen, setSandboxOpen] = useState(false);

  const onCancel = useCallback(() => {
    router.back();
  }, []);

  return (
    <div className="block min-h-full mt-4" data-testid="function-readonly-view">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="block space-y-6 col-span-1 order-2 lg:order-1 lg:col-span-6 xl:col-span-7 2xl:col-span-8">
          <div className="block">
            <div className="flex mb-3 leading-6 justify-between">
              <label className="block text-sm font-medium">
                Code &#40;Node.js&#41;
              </label>
            </div>
            <CodeEditorInput id='code-editor' value={functionRecord.code} readOnly={true} />
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
            {
              functionRecord && authVars !== false && (
                <div className="block">
                  <Button variant='ghost' type="button" className="flex w-[100px] justify-center rounded-md text-sm font-semibold" onClick={() => setSandboxOpen(true)}>
                    <BugPlayIcon className="inline-block mr-2 h-5" /> Test
                  </Button>
                </div>
              )
            }
          </div>
          <TabsContent value="function-tab" className='block space-y-6'>
            <div className="grid grid-cols-12 gap-x-4 gap-y-1">
              <div className="col-span-3 block">
                <label className="block text-sm font-medium leading-6">
                  Method
                </label>
                <p className="text-sm font-normal text-gray-300 leading-6">{functionRecord.httpVerb}</p>
              </div>
              <div className="col-span-9 block">
                <label className="block text-sm font-medium leading-6">
                  Slug
                </label>
                <p className="text-sm font-normal text-gray-300 leading-6">{functionRecord.slug}</p>
              </div>
            </div>
            <div className="block">
              <label className="block text-sm font-medium leading-6">
                Description
              </label>
              <p className="text-sm font-normal text-gray-300 leading-6">{functionRecord.description}</p>
            </div>
            <div className="block">
              <label className="block text-sm font-medium leading-6">
                Tags
              </label>
              <p className="text-sm font-normal text-gray-300 leading-6">{functionRecord.tags.map(elem => elem.name).join(', ')}</p>
            </div>
          </TabsContent>
          <TabsContent value="arguments-tab" className='block space-y-6'>
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
                      <tr key={item.id} className="border-b" title={item.defaultValue ? `Default value "${ item.defaultValue }"` : 'No default value'}>
                        <td className={cn("py-3 text-sm", { 'font-semibold': item.isRequired })}>{item.isRequired ? '*' : ''}{item.name}</td>
                        <td className="py-3 px-2 text-sm text-amber-500">{item.type}</td>
                        <td className="py-3 text-sm max-w-xs truncate">{item.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>
          {
            authVars !== false && (
              <TabsContent value="vars-tab" className='block space-y-6'>
                <EnvVarsSection envVars={authVars.envVars} />
                <UserVarsTable userVarsRecord={authVars.userVars} />
              </TabsContent>
            )
          }
        </Tabs>
        {
          functionRecord && authVars !== false && (
            <FormSlideOver title="Sandbox" open={isSandboxOpen} setOpen={setSandboxOpen}>
              <CodeSandboxForm functionRecord={functionRecord} onClose={() => setSandboxOpen(false)} isMarketplace={ true } />
            </FormSlideOver>
          )
        }
      </div>
    </div>
  );
};
