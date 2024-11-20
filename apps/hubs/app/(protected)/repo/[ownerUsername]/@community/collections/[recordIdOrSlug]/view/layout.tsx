import { Suspense, type ReactNode } from 'react';

import CollectionViewSkeleton from './loading';

async function Layout({ children }: { children: ReactNode }) {
  return <Suspense fallback={<CollectionViewSkeleton />}>{children}</Suspense>;
}

export default Layout;
