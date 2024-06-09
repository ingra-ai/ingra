import { Suspense, type PropsWithChildren, type ReactNode } from 'react';
import MarketplaceViewFunctionSkeleton from './loading';

async function Layout ({ 
  params,
  children 
}: { 
  params: { recordId: string },
  children: ReactNode
}) {
  return (
    <div className='relative' data-testid="marketplace-view-function-layout">
      <Suspense fallback={<MarketplaceViewFunctionSkeleton />}>
        { children }
      </Suspense>
    </div>
  );
}

export default Layout;
