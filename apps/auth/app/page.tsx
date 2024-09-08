import { APP_AUTH_LOGIN_URL, APP_LANDING_PAGE_URL } from '@repo/shared/lib/constants';
import { RedirectType, redirect } from 'next/navigation';
import { getAuthSession } from '@repo/shared/data/auth/session';
import { isSafeRedirectUrl } from '@repo/shared/lib/utils/isSafeRedirectUrl';

export default async function Page({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  const authSession = await getAuthSession();
  const { redirectTo } = searchParams;

  if (!authSession) {
    if (typeof redirectTo === 'string' && redirectTo.length > 0 && isSafeRedirectUrl(redirectTo)) {
      redirect(`${APP_AUTH_LOGIN_URL}?redirectTo=${encodeURIComponent(redirectTo)}`, RedirectType.replace);
    } else {
      redirect(APP_AUTH_LOGIN_URL, RedirectType.replace);
    }
  } else {
    if (typeof redirectTo === 'string' && redirectTo.length > 0 && isSafeRedirectUrl(redirectTo)) {
      redirect(redirectTo, RedirectType.push);
    } else {
      redirect(APP_LANDING_PAGE_URL, RedirectType.replace);
    }
  }
}