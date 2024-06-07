import { Suspense, type PropsWithChildren, type ReactNode } from 'react';
import MarketplaceViewFunctionPage from './page';
import MarketplaceViewFunctionSkeleton from './loading';

async function Layout ({ 
  params,
  children 
}: { 
  params: { recordId: string },
  children: ReactNode
}) {
  return (
    <div className='relative' data-testid="function-edit-layout">
      <Suspense fallback={<MarketplaceViewFunctionSkeleton />}>
        <MarketplaceViewFunctionPage params={ params } />
      </Suspense>
    </div>
  );
}

export default Layout;
