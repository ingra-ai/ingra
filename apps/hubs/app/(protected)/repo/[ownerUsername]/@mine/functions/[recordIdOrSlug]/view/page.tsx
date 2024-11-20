import { getAuthSession } from '@repo/shared/data/auth/session';
import { getUserRepoFunctionsEditUri } from '@repo/shared/lib/constants/repo';
import { RedirectType, notFound, redirect } from 'next/navigation';

type Props = {
  params: Promise<{ ownerUsername: string; recordIdOrSlug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function Page(props: Props) {
  const [params, searchParams, authSession] = await Promise.all([
    props.params,
    props.searchParams,
    getAuthSession()
  ]);
  const { ownerUsername, recordIdOrSlug } = params;

  if (!authSession || authSession.user.profile?.userName !== ownerUsername) {
    return notFound();
  }

  redirect(getUserRepoFunctionsEditUri(authSession.user.profile?.userName, recordIdOrSlug), RedirectType.replace);
}
