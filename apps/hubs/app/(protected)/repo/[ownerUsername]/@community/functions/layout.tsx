import { APP_NAME } from '@repo/shared/lib/constants';
import { Suspense, type ReactNode } from 'react';

import SubscriptionListSkeleton from './loading';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: ['Function Subscriptions', APP_NAME].join(' | '),
};

async function Layout({ children }: { children: ReactNode }) {
  return <Suspense fallback={<SubscriptionListSkeleton />}>{children}</Suspense>;
}

export default Layout;
