import { generateUserVars } from '@app/api/utils/vm/generateUserVars';
import { getAuthSession } from '@app/auth/session';
import { Tabs, TabsList, TabsContent, TabsTrigger } from '@components/ui/tabs';
import db from '@lib/db';
import { FunctionForm } from '@protected/functions/FunctionForm';
import { UserVarsTable } from '@protected/functions/UserVarsTable';
import { EnvVarsSection } from '@protected/settings/env-vars/EnvVarsSection';
import { RedirectType, notFound, redirect } from 'next/navigation';

export default async function Page({ params }: { params: { recordId: string } }) {
  const authSession = await getAuthSession();
  const recordId = params?.recordId;

  if (!recordId || !authSession) {
    return notFound();
  }

  const functionRecord = await db.function.findUnique({
    where: {
      id: recordId,
      ownerUserId: authSession.user.id,
    },
    include: {
      tags: true,
      arguments: true
    },
  });

  if (!functionRecord) {
    return redirect('/functions', RedirectType.replace);
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
          <TabsContent value="function-form-tab" className='block space-y-6 mt-4'>
            <FunctionForm functionRecord={functionRecord} envVars={optionalEnvVars} userVars={userVarsRecord} />
          </TabsContent>
          <TabsContent value="vars-tab" className='block space-y-6 mt-4'>
            <EnvVarsSection envVars={optionalEnvVars || []} />
            <UserVarsTable userVarsRecord={userVarsRecord} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
