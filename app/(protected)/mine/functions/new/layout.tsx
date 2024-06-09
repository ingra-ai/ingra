import { Suspense, type ReactNode, type PropsWithChildren } from 'react';
import FunctionNewSkeleton from './loading';

async function Layout ({ 
  children 
}: { 
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
