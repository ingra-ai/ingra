import { APP_NAME } from '@repo/shared/lib/constants';
import { Suspense, type ReactNode, type PropsWithChildren } from 'react';

import FunctionNewSkeleton from './loading';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: ['New Function', APP_NAME].join(' | '),
};

async function Layout({ params, children }: { params: { ownerUsername: string; recordId: string }; children: ReactNode }) {
  return <Suspense fallback={<FunctionNewSkeleton />}>{children}</Suspense>;
}

export default Layout;
