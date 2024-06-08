import { Suspense, type ReactNode, type PropsWithChildren } from 'react';
import MarketplaceNav from './MarketplaceNav';

async function Layout ({ 
  searchParams,
  children
}: { 
  searchParams: Record<string, string | string[] | undefined>;
  children: ReactNode;
}) {
  return (
    <div className="relative block" data-testid="marketplace-layout">
      <MarketplaceNav className="mb-6" />

      <Suspense fallback={<div>Loading...</div>}>
        { children }
      </Suspense>
    </div>
  );
}

export default Layout;
