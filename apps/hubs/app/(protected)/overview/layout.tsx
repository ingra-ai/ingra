import type { ReactNode } from 'react';
import { Suspense } from 'react';
import OverviewSkeleton from './loading';
import TopSubNav from '@/components/navs/TopSubNav';
import { OverviewNavRoutes } from './OverviewNavRoutes';

async function Layout({ children }: { children: ReactNode }) {
  return (
    <div id="overview-layout" className="relative p-4 h-full w-full" data-testid="overview-layout">
      <TopSubNav navItems={OverviewNavRoutes} />
      <Suspense fallback={<OverviewSkeleton />}>{children}</Suspense>
    </div>
  );
}

export default Layout;
