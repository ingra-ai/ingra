import { Suspense, type ReactNode, type PropsWithChildren } from 'react';
import MarketplacePage from './page';
import MarketplaceSkeleton from './loading';

async function Layout ({ 
  searchParams,
  children 
}: { 
  searchParams: Record<string, string | string[] | undefined>,
  children: ReactNode
}) {
  return (
    <div className='relative' data-testid="marketplace-layout">
      <Suspense fallback={<MarketplaceSkeleton />}>
        <MarketplacePage searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

export default Layout;
