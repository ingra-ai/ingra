import { generateUserVars } from '@app/api/utils/vm/generateUserVars';
import { getAuthSession } from '@app/auth/session';
import db from '@lib/db';
import { FunctionForm } from '@protected/functions/FunctionForm';
import { RedirectType, notFound, redirect } from 'next/navigation';

export default async function Page({ params }: { params: { recordId: string } }) {
  const authSession = await getAuthSession();
  const recordId = params?.recordId;

  if ( !recordId || !authSession ) {
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

  if ( !functionRecord ) {
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
        <FunctionForm functionRecord={functionRecord} envVars={ optionalEnvVars } userVars={ userVarsRecord } />
      </div>
    </div>
  );
}
