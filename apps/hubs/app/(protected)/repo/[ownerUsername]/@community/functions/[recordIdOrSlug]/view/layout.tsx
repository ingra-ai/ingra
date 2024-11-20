import { APP_NAME } from '@repo/shared/lib/constants';
import { Metadata, ResolvingMetadata } from 'next';
import { Suspense, type ReactNode } from 'react';

import LoaderSkeleton from './loading';


type Props = {
  params: Promise<{ ownerUsername: string; recordIdOrSlug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata(props: Props, parent: ResolvingMetadata): Promise<Metadata> {
  const params = await props.params;
  const { ownerUsername, recordIdOrSlug } = params;

  return {
    title: [`${ownerUsername}'s Functions`, APP_NAME].join(' | '),
  };
}

async function Layout({ children }: { children: ReactNode }) {
  return <Suspense fallback={<LoaderSkeleton />}>{children}</Suspense>;
}

export default Layout;
