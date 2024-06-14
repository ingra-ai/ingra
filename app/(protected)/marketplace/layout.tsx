import { Suspense, type ReactNode, type PropsWithChildren } from 'react';
import { MarketplaceNavRoutes } from './MarketplaceNavRoutes';
import TopSubNav from '@components/navs/TopSubNav';
import { APP_NAME } from '@lib/constants';
import type { Metadata } from 'next'
 
export const metadata: Metadata = {
  title: ['Marketplace', APP_NAME].join(' | '),
}

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
