import { Suspense, type ReactNode, type PropsWithChildren } from 'react';
import SubscriptionListSkeleton from './loading';

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
