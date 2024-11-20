import { APP_NAME } from '@repo/shared/lib/constants';
import { Suspense, type ReactNode } from 'react';

import FunctionNewSkeleton from './loading';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: ['New Function', APP_NAME].join(' | '),
};

async function Layout({ children }: { children: ReactNode }) {
  return <Suspense fallback={<FunctionNewSkeleton />}>{children}</Suspense>;
}

export default Layout;
