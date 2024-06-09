import { RedirectType, redirect } from 'next/navigation';

export default async function Page() {
  redirect('/subscriptions/collections', RedirectType.replace);
}
