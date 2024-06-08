import { RedirectType, redirect } from 'next/navigation';

export default async function Page() {
  redirect('/mine/subscriptions/collections', RedirectType.replace);
}
