import { Suspense, type ReactNode, type PropsWithChildren } from 'react';
import FunctionNewSkeleton from './loading';

async function Layout ({ 
  searchParams,
  children 
}: { 
  searchParams: Record<string, string | string[] | undefined>,
  children: ReactNode
}) {
  return (
    <div className='relative' data-testid="function-new-layout">
      <Suspense fallback={<FunctionNewSkeleton />}>
        { children }
      </Suspense>
    </div>
  );
}

export default Layout;
