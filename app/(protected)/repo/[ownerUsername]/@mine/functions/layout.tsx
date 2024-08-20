import { Suspense, type ReactNode, type PropsWithChildren } from 'react';
import FunctionListSkeleton from './loading';
import type { Metadata } from 'next'
import { APP_NAME } from '@lib/constants';
 
export const metadata: Metadata = {
  title: ['My Functions', APP_NAME].join(' | ')
}

async function Layout ({ 
  children 
}: { 
  children: ReactNode
}) {
  return (
    <Suspense fallback={<FunctionListSkeleton />}>
      { children }
    </Suspense>
  );
}

export default Layout;
