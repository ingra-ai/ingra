import { APP_NAME } from '@repo/shared/lib/constants';
import { Suspense, type ReactNode } from 'react';

import LoadingSkeleton from './loading';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: ['Collection Marketplace', APP_NAME].join(' | '),
};

async function Layout({ children }: { children: ReactNode }) {
  return <Suspense fallback={<LoadingSkeleton />}>{children}</Suspense>;
}

export default Layout;
