import { Suspense, type ReactNode } from 'react';

import FunctionEditSkeleton from './loading';

async function Layout({ children }: { children: ReactNode }) {
  return <Suspense fallback={<FunctionEditSkeleton />}>{children}</Suspense>;
}

export default Layout;
