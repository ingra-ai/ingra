import { Suspense, type ReactNode } from 'react';

import LoaderSkeleton from './loading';

async function Layout({ children }: { children: ReactNode }) {
  return <Suspense fallback={<LoaderSkeleton />}>{children}</Suspense>;
}

export default Layout;
