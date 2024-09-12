import { DOCS_PAGE_ROUTES } from '@/lib/routes-config';
import { redirect } from 'next/navigation';

export default function Home() {
  return redirect(`/docs${DOCS_PAGE_ROUTES[0].href}`);
}
