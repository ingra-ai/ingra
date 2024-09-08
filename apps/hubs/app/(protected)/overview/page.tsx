import { redirect, RedirectType } from 'next/navigation';

export default async function Page() {
  redirect('/overview/dashboard', RedirectType.replace);
}
