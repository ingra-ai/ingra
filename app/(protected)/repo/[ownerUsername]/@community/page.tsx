import { getUserRepoCollectionsUri } from '@lib/constants/repo';
import { RedirectType, redirect } from 'next/navigation';

type ThisPageParams = {
  params: {
    ownerUsername: string;
  }
};

export default async function Page({ params }: ThisPageParams) {
  return redirect(getUserRepoCollectionsUri( params.ownerUsername ), RedirectType.replace);
}
