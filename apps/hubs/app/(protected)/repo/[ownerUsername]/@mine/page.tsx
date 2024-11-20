import { getUserRepoCollectionsUri } from '@repo/shared/lib/constants/repo';
import { RedirectType, redirect } from 'next/navigation';

type Props = {
  params: Promise<{ ownerUsername: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function Page(props: Props) {
  const params = await props.params;
  return redirect(getUserRepoCollectionsUri(params.ownerUsername), RedirectType.replace);
}
