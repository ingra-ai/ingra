import { getUserRepoCollectionsViewUri } from '@repo/shared/lib/constants/repo';
import { notFound, redirect, RedirectType } from 'next/navigation';

type Props = {
  params: Promise<{ ownerUsername: string; recordIdOrSlug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function Page(props: Props) {
  const params = await props.params;
  const { recordIdOrSlug, ownerUsername } = params;

  if (!recordIdOrSlug || !ownerUsername) {
    return notFound();
  }

  redirect(getUserRepoCollectionsViewUri(ownerUsername, recordIdOrSlug), RedirectType.replace);
}
