import type { ReactNode } from 'react';
import { Suspense } from 'react';
import AssistantSkeleton from './loading';

async function Layout ({ 
  children 
}: { 
  children: ReactNode
}) {
  return (
    <div id="assistant-layout" className='relative' data-testid="assistant-layout">
      <Suspense fallback={<AssistantSkeleton />}>
        { children }
      </Suspense>
    </div>
  );
}

export default Layout;
