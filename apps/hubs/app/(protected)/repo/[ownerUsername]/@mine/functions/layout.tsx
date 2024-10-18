import { Suspense, type PropsWithChildren } from 'react';

import LoaderSkeleton from './loading';

async function Layout({ children }: PropsWithChildren) {
  return <Suspense fallback={<LoaderSkeleton />}>{children}</Suspense>;
}

export default Layout;
