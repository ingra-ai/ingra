import { Suspense, type PropsWithChildren, type ReactNode } from 'react';
import FunctionEditSkeleton from './loading';

async function Layout ({ 
  params,
  children 
}: { 
  params: { recordId: string },
  children: ReactNode
}) {
  return (
    <div className='relative' data-testid="function-edit-layout">
      <Suspense fallback={<FunctionEditSkeleton />}>
        { children }
      </Suspense>
    </div>
  );
}

export default Layout;
