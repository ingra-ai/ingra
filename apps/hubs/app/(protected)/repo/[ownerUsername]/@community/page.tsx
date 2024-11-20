import { getUserRepoCollectionsUri } from '@repo/shared/lib/constants/repo';
import { RedirectType, redirect } from 'next/navigation';

type ThisPageParams = {
  params: Promise<{
    ownerUsername: string;
  }>;
};

export default async function Page(props: ThisPageParams) {
  const params = await props.params;
  return redirect(getUserRepoCollectionsUri(params.ownerUsername), RedirectType.replace);
}
