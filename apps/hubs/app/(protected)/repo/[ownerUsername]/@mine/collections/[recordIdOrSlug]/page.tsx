import { getUserRepoCollectionsViewUri } from '@repo/shared/lib/constants/repo';
import { notFound, redirect, RedirectType } from 'next/navigation';

type Props = {
  params: { ownerUsername: string; recordIdOrSlug: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export default async function Page({ params }: Props) {
  const { recordIdOrSlug, ownerUsername } = params;

  if (!recordIdOrSlug || !ownerUsername) {
    return notFound();
  }

  redirect(getUserRepoCollectionsViewUri(ownerUsername, recordIdOrSlug), RedirectType.replace);
}
