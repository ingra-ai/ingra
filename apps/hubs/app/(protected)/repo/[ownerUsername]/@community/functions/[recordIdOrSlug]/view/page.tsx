import { generateUserVars } from '@repo/shared/utils/vm/generateUserVars';
import { getAuthSession } from '@repo/shared/data/auth/session';
import { CommunityFunctionReadOnlyView } from '@repo/components/data/functions/community/CommunityFunctionReadOnlyView';
import { notFound } from 'next/navigation';
import { getFunctionAccessibleByUser } from '@repo/shared/data/functions';

type Props = {
  params: { ownerUsername: string; recordIdOrSlug: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export default async function Page({ params }: Props) {
  const { recordIdOrSlug, ownerUsername } = params;
  const authSession = await getAuthSession();

  if (!recordIdOrSlug) {
    return notFound();
  }

  const functionRecord = await getFunctionAccessibleByUser(ownerUsername, recordIdOrSlug, {
    accessTypes: ['marketplace'],
    findFirstArgs: {
      include: {
        owner: {
          select: {
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

  return (
    <div className="block" data-testid="community-function-view-page">
      <div className="mb-4">
        <h1 className="text-base font-semibold leading-10">
          {ownerUsername}&apos;s Function - {functionRecord.slug}
        </h1>
      </div>
      <div className="block">
        <CommunityFunctionReadOnlyView
          functionRecord={functionRecord}
          authVars={
            authSession
              ? {
                  envVars: authSession.user.envVars.map((envVar) => ({
                    id: envVar.id,
                    ownerUserId: envVar.ownerUserId,
                    key: envVar.key,
                    value: envVar.value,
                  })),
                  userVars: generateUserVars(authSession),
                }
              : false
          }
        />
      </div>
    </div>
  );
}
