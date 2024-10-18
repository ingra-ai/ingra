import { APP_NAME } from '@repo/shared/lib/constants';
import { Suspense } from 'react';

import AssistantSkeleton from './loading';

import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: ['Assistant', APP_NAME].join(' | '),
};

async function Layout({ children }: { children: ReactNode }) {
  return (
    <div id="assistant-layout" className="relative h-full w-full overflow-hidden" data-testid="assistant-layout">
      <Suspense fallback={<AssistantSkeleton />}>{children}</Suspense>
    </div>
  );
}

export default Layout;
