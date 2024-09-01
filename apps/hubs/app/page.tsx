import { APP_LANDING_PAGE_URL } from '@repo/shared/lib/constants';
import { RedirectType, redirect } from 'next/navigation';

export default async function Home() {
  redirect(APP_LANDING_PAGE_URL, RedirectType.replace);
}
