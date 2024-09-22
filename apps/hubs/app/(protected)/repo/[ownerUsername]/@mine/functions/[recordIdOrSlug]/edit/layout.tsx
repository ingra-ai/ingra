import { Suspense, type PropsWithChildren } from 'react';
import FunctionEditSkeleton from './loading';

async function Layout({ children }: PropsWithChildren) {
  return <Suspense fallback={<FunctionEditSkeleton />}>{children}</Suspense>;
}

export default Layout;
