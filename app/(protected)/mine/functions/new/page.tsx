import { getAuthSession } from '@app/auth/session';
import { notFound } from 'next/navigation';
import { FunctionForm } from '@protected/mine/functions/FunctionForm';
import { generateUserVars } from '@app/api/utils/vm/generateUserVars';

export default async function Page() {
  const authSession = await getAuthSession();

  if ( !authSession ) {
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
    <div className="block" data-testid="functions-new-page">
      <div className="block">
        <div className="mb-4">
          <h1 className="text-base font-semibold leading-10">Add New Function</h1>
        </div>
        <div className="block">
          <FunctionForm envVars={optionalEnvVars} userVars={ userVarsRecord } />
        </div>
      </div>
    </div>
  );
}
