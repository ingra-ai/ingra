import { Suspense, type ReactNode, type PropsWithChildren } from 'react';
import FunctionNewSkeleton from './loading';
import type { Metadata } from 'next'
import { APP_NAME } from '@lib/constants';
 
export const metadata: Metadata = {
  title: ['New Function', APP_NAME].join(' | '),
}

async function Layout ({ 
  children 
}: { 
  children: ReactNode
}) {
  return (
    <div className='relative' data-testid="function-new-layout">
      <Suspense fallback={<FunctionNewSkeleton />}>
        { children }
      </Suspense>
    </div>
  );
}

export default Layout;
