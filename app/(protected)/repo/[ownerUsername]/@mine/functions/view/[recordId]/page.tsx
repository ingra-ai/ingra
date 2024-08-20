import { getAuthSession } from '@app/auth/session';
import { RedirectType, notFound, redirect } from 'next/navigation';

export default async function Page({ params }: { params: { ownerUsername: string; recordId: string } }) {
  const { ownerUsername, recordId } = params;
  const authSession = await getAuthSession();

  if ( !authSession || authSession.user.profile?.userName !== ownerUsername ) {
    return notFound();
  }
  
  redirect(`/repo/${ authSession.user.profile?.userName }/functions/edit/${ recordId }`, RedirectType.replace);
}
