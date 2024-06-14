import { Suspense, type ReactNode, type PropsWithChildren } from 'react';
import SubscriptionListSkeleton from './loading';
import { APP_NAME } from '@lib/constants';
import type { Metadata } from 'next'
 
export const metadata: Metadata = {
  title: ['Function Subscriptions', APP_NAME].join(' | '),
}

async function Layout ({ 
  children 
}: { 
  children: ReactNode
}) {
  return (
    <div className='relative' data-testid="subscriptions-mine-layout">
      <Suspense fallback={<SubscriptionListSkeleton />}>
        { children }
      </Suspense>
    </div>
  );
}

export default Layout;
