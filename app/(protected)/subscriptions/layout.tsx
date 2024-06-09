import { Suspense, type ReactNode, type PropsWithChildren } from 'react';
import { SubscriptionNavRoutes } from './SubscriptionNavRoutes';
import TopSubNav from '@components/navs/TopSubNav';

async function Layout ({ 
  searchParams,
  children
}: { 
  searchParams: Record<string, string | string[] | undefined>;
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
