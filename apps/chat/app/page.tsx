import { APP_AUTH_LOGIN_URL, APP_LANDING_PAGE_URL } from '@repo/shared/lib/constants';
import { RedirectType, redirect } from 'next/navigation';
import { getAuthSession } from '@repo/shared/data/auth/session';
import { isSafeRedirectUrl } from '@repo/shared/lib/utils/isSafeRedirectUrl';

export default async function Page({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  return (
    <div>
      Chat Page
    </div>
  );
}
