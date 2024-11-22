import { LoaderV1 } from '@repo/components/loaders/loader-v1';
import { APP_NAME } from '@repo/shared/lib/constants';
import { Suspense, type ReactNode } from 'react';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: ['Marketplace', APP_NAME].join(' | '),
};

async function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="relative xl:container px-2 sm:px-8" data-testid="marketplace-layout">
      <Suspense 
        fallback={<LoaderV1 message="Loading..." cloudSize={24} duration={1.5} delay={0.2} fallbackUrl="/" />}
      >
        {children}
      </Suspense>
      
    </div>
  );
}

export default Layout;
