import { RedirectType, redirect } from 'next/navigation';

export default async function Page() {
  redirect('/functions/list', RedirectType.replace);
}
