import { Suspense, type ReactNode, type PropsWithChildren } from 'react';
import { SubscriptionNavRoutes } from './SubscriptionNavRoutes';
import TopSubNav from '@components/navs/TopSubNav';
import { APP_NAME } from '@lib/constants';
import type { Metadata } from 'next'
 
export const metadata: Metadata = {
  title: ['Subscriptions', APP_NAME].join(' | '),
}

async function Layout ({ 
  children
}: { 
  children: ReactNode;
}) {
  return (
    <div className="relative block" data-testid="subscriptions-layout">
      <TopSubNav navItems={SubscriptionNavRoutes} />

      <Suspense fallback={<div>Loading...</div>}>
        { children }
      </Suspense>
    </div>
  );
}

export default Layout;
