import { RedirectType, redirect } from 'next/navigation';

import { getChatUri } from '@/lib/constants';

type Props = {
  params: Promise<Record<string, string | string[] | undefined>>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function Page(props: Props) {
  redirect(getChatUri(), RedirectType.replace);
}