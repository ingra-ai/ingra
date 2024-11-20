import { EnvVarsSection } from '@repo/components/data/envVars/EnvVarsSection';
import { UserVarsTable } from '@repo/components/data/envVars/UserVarsTable';
import { FunctionForm } from '@repo/components/data/functions/mine/FunctionForm';
import { Tabs, TabsList, TabsContent, TabsTrigger } from '@repo/components/ui/tabs';
import { getAuthSession } from '@repo/shared/data/auth/session';
import { getFunctionAccessibleByUser } from '@repo/shared/data/functions';
import { APP_NAME } from '@repo/shared/lib/constants';
import { generateUserVars } from '@repo/shared/utils/vm/generateUserVars';
import { notFound } from 'next/navigation';

import type { Metadata, ResolvingMetadata } from 'next';

type Props = {
  params: Promise<{ ownerUsername: string; recordIdOrSlug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata(props: Props, parent: ResolvingMetadata): Promise<Metadata> {
  const params = await props.params;
  const { ownerUsername, recordIdOrSlug } = params;

  return {
    title: [`${recordIdOrSlug} - Edit Function`, APP_NAME].join(' | '),
  };
}

export default async function Page(props: Props) {
  const [params, authSession] = await Promise.all([
    props.params, 
    getAuthSession()
  ]);
  const { ownerUsername, recordIdOrSlug } = params;

  if (!recordIdOrSlug || !authSession) {
    return notFound();
  }

  const functionRecord = await getFunctionAccessibleByUser(authSession.user.id, recordIdOrSlug, {
    accessTypes: ['owner'],
    findFirstArgs: {
      include: {
        owner: {
          select: {
            id: true,
            profile: {
              select: {
                userName: true,
              },
            },
          },
        },
        tags: true,
        arguments: true,
      },
    },
  });

  if (!functionRecord) {
    return notFound();
  }

  const optionalEnvVars = authSession.user.envVars.map((envVar) => ({
    id: envVar.id,
    ownerUserId: envVar.ownerUserId,
    key: envVar.key,
    value: envVar.value,
  }));

  const userVarsRecord = generateUserVars(authSession);

  return (
    <div className="block" data-testid="functions-edit-page">
      <div className="mb-4">
        <h1 className="text-base font-semibold leading-10">Edit Function</h1>
      </div>
      <div className="block">
        <Tabs id="function-edit-page-tabs" defaultValue="function-form-tab" className="block">
          <TabsList className="">
            <TabsTrigger value="function-form-tab">Function Form</TabsTrigger>
            <TabsTrigger value="vars-tab">Variables</TabsTrigger>
          </TabsList>
          <TabsContent value="function-form-tab" className="block space-y-6 mt-4">
            <FunctionForm authSession={authSession} ownerUsername={ownerUsername} functionRecord={functionRecord} />
          </TabsContent>
          <TabsContent value="vars-tab" className="block space-y-6 mt-4">
            <EnvVarsSection envVars={optionalEnvVars || []} />
            <UserVarsTable userVarsRecord={userVarsRecord} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
