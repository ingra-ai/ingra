import { RedirectType, redirect } from 'next/navigation';

export default async function Page() {
  redirect('/functions/mine', RedirectType.replace);
}
