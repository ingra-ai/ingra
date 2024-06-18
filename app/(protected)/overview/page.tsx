import { getAuthSession } from '@app/auth/session';
import { APP_AUTH_LOGIN_URL } from '@lib/constants';
import { redirect, RedirectType } from 'next/navigation';

export default async function Page() {
  const authSession = await getAuthSession();

  if (!authSession) {
    redirect(APP_AUTH_LOGIN_URL, RedirectType.replace);
  }

  redirect('/overview/dashboard', RedirectType.replace);
}
