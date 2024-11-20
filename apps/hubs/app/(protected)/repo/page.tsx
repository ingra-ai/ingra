import { getUserRepoCollectionsUri } from '@repo/shared/lib/constants/repo';
import { RedirectType, notFound, redirect } from 'next/navigation';

type Props = {
  params: Promise<{ ownerUsername: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function Page(props: Props) {
  const [params] = await Promise.all([
    props.params
  ]);
  const { ownerUsername } = params;

  if (ownerUsername) {
    return redirect(getUserRepoCollectionsUri(ownerUsername), RedirectType.replace);
  } else {
    return notFound();
  }
}
