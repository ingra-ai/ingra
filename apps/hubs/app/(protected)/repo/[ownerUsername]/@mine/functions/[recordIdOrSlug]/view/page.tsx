import { getAuthSession } from '@repo/shared/data/auth/session';
import { getUserRepoFunctionsEditUri } from '@repo/shared/lib/constants/repo';
import { RedirectType, notFound, redirect } from 'next/navigation';

type Props = {
  params: { ownerUsername: string; recordIdOrSlug: string }
  searchParams: { [key: string]: string | string[] | undefined }
}

export default async function Page({ params }: Props) {
  const { ownerUsername, recordIdOrSlug } = params;
  const authSession = await getAuthSession();

  if (!authSession || authSession.user.profile?.userName !== ownerUsername) {
    return notFound();
  }

  redirect(getUserRepoFunctionsEditUri(authSession.user.profile?.userName, recordIdOrSlug), RedirectType.replace);
}
