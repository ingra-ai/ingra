import { APP_NAME } from '@repo/shared/lib/constants';
import { Metadata, ResolvingMetadata } from 'next';
import { PropsWithChildren, Suspense, type ReactNode } from 'react';

import LoaderSkeleton from './loading';


type Props = {
  params: { ownerUsername: string; recordIdOrSlug: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata({ params, searchParams }: Props, parent: ResolvingMetadata): Promise<Metadata> {
  const { ownerUsername, recordIdOrSlug } = params;

  return {
    title: [`${ownerUsername}'s Functions`, APP_NAME].join(' | '),
  };
}

async function Layout({ children }: PropsWithChildren<Props>) {
  return <Suspense fallback={<LoaderSkeleton />}>{children}</Suspense>;
}

export default Layout;
