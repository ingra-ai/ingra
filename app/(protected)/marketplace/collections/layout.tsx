import { Suspense, type ReactNode, type PropsWithChildren } from 'react';
import LoadingSkeleton from './loading';

async function Layout ({ 
  searchParams,
  children 
}: { 
  searchParams: Record<string, string | string[] | undefined>,
  children: ReactNode
}) {
  return (
    <div className='relative' data-testid="marketplace-collections-layout">
      <Suspense fallback={<LoadingSkeleton />}>
        { children }
      </Suspense>
    </div>
  );
}

export default Layout;
