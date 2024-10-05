import { Suspense, type ReactNode, type PropsWithChildren } from 'react';
import { APP_NAME } from '@repo/shared/lib/constants';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: ['Marketplace', APP_NAME].join(' | '),
};

async function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="relative xl:container" data-testid="marketplace-layout">
      <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
    </div>
  );
}

export default Layout;
