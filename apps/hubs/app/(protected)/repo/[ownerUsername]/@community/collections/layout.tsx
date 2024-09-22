import { Suspense, type ReactNode } from 'react';
import SubscriptionListSkeleton from './loading';

async function Layout({ children }: { children: ReactNode }) {
  return <Suspense fallback={<SubscriptionListSkeleton />}>{children}</Suspense>;
}

export default Layout;
