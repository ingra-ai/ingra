import { generateUserVars } from '@app/api/utils/vm/generateUserVars';
import { getAuthSession } from '@app/auth/session';
import db from '@lib/db';
import { isUuid } from "@lib/utils";
import { CommunityFunctionReadOnlyView } from '@components/data/functions/CommunityFunctionReadOnlyView';
import { notFound } from 'next/navigation';

export default async function Page({ params }: { params: { ownerUsername: string; recordId: string } }) {
  const { recordId, ownerUsername } = params;
  const authSession = await getAuthSession();

  if ( !recordId || !isUuid(recordId) ) {
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
    return notFound();
  }

  return (
    <div className="block" data-testid="community-function-view-page">
      <div className="mb-4">
        <h1 className="text-base font-semibold leading-10">{ownerUsername}&apos;s Function - { functionRecord.slug }</h1>
      </div>
      <div className="block">
        <CommunityFunctionReadOnlyView 
          functionRecord={functionRecord}
          authVars={ authSession ? {
            envVars: authSession.user.envVars.map((envVar) => ({
              id: envVar.id,
              ownerUserId: envVar.ownerUserId,
              key: envVar.key,
              value: envVar.value,
            })),
            userVars: generateUserVars(authSession)
          } : false }
        />
      </div>
    </div>
  );
}
