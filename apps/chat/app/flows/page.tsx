import { getAuthSession } from '@repo/shared/data/auth/session';
import { notFound } from 'next/navigation';

import Flow from '@/components/flow/Flow';

type Props = {
  params: Promise<Record<string, string | string[] | undefined>>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function Page(props: Props) {
  const authSession = await getAuthSession();

  if (!authSession) {
    return notFound();
  }

  return (
    <Flow />
  );
}