import { Suspense, type ReactNode, type PropsWithChildren } from 'react';
import FunctionListSkeleton from './loading';

async function Layout ({ 
  searchParams,
  children 
}: { 
  searchParams: Record<string, string | string[] | undefined>,
  children: ReactNode
}) {
  return (
    <div className='relative' data-testid="function-mine-layout">
      <Suspense fallback={<FunctionListSkeleton />}>
        { children }
      </Suspense>
    </div>
  );
}

export default Layout;