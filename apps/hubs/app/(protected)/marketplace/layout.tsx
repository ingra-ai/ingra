import { APP_NAME } from '@repo/shared/lib/constants';
import { Suspense, type ReactNode } from 'react';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: ['Marketplace', APP_NAME].join(' | '),
};

async function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="relative xl:container px-2 sm:px-8" data-testid="marketplace-layout">
      <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
    </div>
  );
}

export default Layout;
