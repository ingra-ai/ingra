import { generateUserVars } from '@app/api/utils/vm/generateUserVars';
import { getAuthSession } from '@app/auth/session';
import db from '@lib/db';
import { FunctionReadOnlyView } from './FunctionReadOnlyView';
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
      isPublished: true,
      isPrivate: false,
    },
    include: {
      tags: true,
      arguments: true
    },
  });

  if ( !functionRecord ) {
    return redirect('/marketplace', RedirectType.replace);
  }

  const optionalEnvVars = authSession.user.envVars.map((envVar) => ({
    id: envVar.id,
    ownerUserId: envVar.ownerUserId,
    key: envVar.key,
    value: envVar.value,
  }));
  
  const userVarsRecord = generateUserVars(authSession);

  return (
    <div className="block" data-testid="marketplace-functions-view-page">
      <div className="mb-4">
        <h1 className="text-base font-semibold leading-10">View Function</h1>
      </div>
      <div className="block">
        <FunctionReadOnlyView functionRecord={functionRecord} envVars={ optionalEnvVars } userVars={ userVarsRecord } />
      </div>
    </div>
  );
}
