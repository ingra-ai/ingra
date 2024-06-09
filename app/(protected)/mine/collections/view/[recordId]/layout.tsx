import { Suspense, type PropsWithChildren, type ReactNode } from 'react';
import CollectionViewPage from './page';
import CollectionViewSkeleton from './loading';

async function Layout ({ 
  params,
  children 
}: { 
  params: { recordId: string },
  children: ReactNode
}) {
  return (
    <div className='relative' data-testid="function-edit-layout">
      <Suspense fallback={<CollectionViewSkeleton />}>
        <CollectionViewPage params={ params } />
      </Suspense>
    </div>
  );
}

export default Layout;
