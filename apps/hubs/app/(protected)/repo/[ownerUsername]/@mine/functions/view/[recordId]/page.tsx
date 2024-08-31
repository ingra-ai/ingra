import { getAuthSession } from '@repo/shared/data/auth/session';
import { getUserRepoFunctionsEditUri } from '@repo/shared/lib/constants/repo';
import { RedirectType, notFound, redirect } from 'next/navigation';

export default async function Page({ params }: { params: { ownerUsername: string; recordId: string } }) {
  const { ownerUsername, recordId } = params;
  const authSession = await getAuthSession();

  if (!authSession || authSession.user.profile?.userName !== ownerUsername) {
    return notFound();
  }

  redirect(getUserRepoFunctionsEditUri(authSession.user.profile?.userName, recordId), RedirectType.replace);
}
