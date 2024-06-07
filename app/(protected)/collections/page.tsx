import { RedirectType, redirect } from 'next/navigation';

export default async function Page() {
  redirect('/collections/mine', RedirectType.replace);
}
