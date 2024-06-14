import { Suspense, type ReactNode, type PropsWithChildren } from 'react';
import LoadingSkeleton from './loading';
import { APP_NAME } from '@lib/constants';
import type { Metadata } from 'next'
 
export const metadata: Metadata = {
  title: ['Collection Marketplace', APP_NAME].join(' | '),
}

async function Layout ({ 
  children 
}: { 
  children: ReactNode
}) {
  return (
    <div className='relative' data-testid="marketplace-collections-layout">
      <Suspense fallback={<LoadingSkeleton />}>
        { children }
      </Suspense>
    </div>
  );
}

export default Layout;
