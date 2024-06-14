import { Suspense, type ReactNode, type PropsWithChildren } from 'react';
import { MineNavRoutes } from './MineNavRoutes';
import TopSubNav from '@components/navs/TopSubNav';
import type { Metadata } from 'next'
import { APP_DESCRIPTION, APP_NAME } from '@lib/constants';
 
export const metadata: Metadata = {
  title: ['Hubs', APP_NAME].join(' | '),
  description: APP_DESCRIPTION,
}

async function Layout ({ 
  children
}: { 
  children: ReactNode;
}) {
  return (
    <div className="relative block" data-testid="mine-layout">
      <TopSubNav navItems={MineNavRoutes} />

      <Suspense fallback={<div>Loading...</div>}>
        { children }
      </Suspense>
    </div>
  );
}

export default Layout;
