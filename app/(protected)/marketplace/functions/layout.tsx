import { Suspense, type ReactNode, type PropsWithChildren } from 'react';
import MarketplaceFunctionLayout from './loading';

async function Layout ({ 
  children 
}: { 
  children: ReactNode
}) {
  return (
    <div className='relative' data-testid="marketplace-functions-layout">
      <Suspense fallback={<MarketplaceFunctionLayout />}>
        { children }
      </Suspense>
    </div>
  );
}

export default Layout;
