import { APP_NAME } from '@repo/shared/lib/constants';
import { Suspense, type ReactNode, type PropsWithChildren } from 'react';

import MarketplaceFunctionLayout from './loading';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: ['Functon Marketplace', APP_NAME].join(' | '),
};

async function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="relative" data-testid="marketplace-functions-layout">
      <Suspense fallback={<MarketplaceFunctionLayout />}>{children}</Suspense>
    </div>
  );
}

export default Layout;
