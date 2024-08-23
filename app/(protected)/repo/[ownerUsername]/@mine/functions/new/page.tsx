import { getAuthSession } from '@data/auth/session';
import { notFound } from 'next/navigation';
import { generateUserVars } from '@app/api/utils/vm/generateUserVars';
import { FunctionForm } from '@components/data/functions/mine/FunctionForm';

export default async function Page({ params }: { params: { ownerUsername: string } }) {
  const authSession = await getAuthSession();
  const { ownerUsername } = params;

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
          <FunctionForm ownerUsername={ownerUsername} envVars={optionalEnvVars} userVars={ userVarsRecord } />
        </div>
      </div>
    </div>
  );
}
