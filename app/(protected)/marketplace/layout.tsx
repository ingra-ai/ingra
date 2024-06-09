import { Suspense, type ReactNode, type PropsWithChildren } from 'react';
import { MarketplaceNavRoutes } from './MarketplaceNavRoutes';
import TopSubNav from '@components/navs/TopSubNav';

async function Layout ({ 
  children
}: { 
  children: ReactNode;
}) {
  return (
    <div className="relative block" data-testid="marketplace-layout">
      <TopSubNav navItems={MarketplaceNavRoutes} />

      <Suspense fallback={<div>Loading...</div>}>
        { children }
      </Suspense>
    </div>
  );
}

export default Layout;
