import { getAuthSession } from '@repo/shared/data/auth/session';
import { APP_AUTH_LOGIN_URL, APP_LANDING_PAGE_URL } from '@repo/shared/lib/constants';
import { isSafeRedirectUrl } from '@repo/shared/lib/utils/isSafeRedirectUrl';
import { RedirectType, redirect } from 'next/navigation';

type Props = {
  params: Promise<Record<string, string | string[] | undefined>>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function Page(props: Props) {
  const [searchParams, authSession] = await Promise.all([
    props.searchParams, 
    getAuthSession()
  ]);
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
