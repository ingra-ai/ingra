import { Suspense, type PropsWithChildren, type ReactNode } from 'react';
import FunctionEditPage from './page';
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
        <FunctionEditPage params={ params } />
      </Suspense>
    </div>
  );
}

export default Layout;
