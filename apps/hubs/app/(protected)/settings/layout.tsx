import { LoaderV1 } from '@repo/components/loaders/loader-v1';
import { APP_NAME } from '@repo/shared/lib/constants';
import { PropsWithChildren, Suspense } from 'react';

import SideNavItem from '@/components/navs/SideNavItem';
import { SettingsNavRoutes } from '@protected/settings/SettingsNavRoutes';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: ['Settings', APP_NAME].join(' | '),
};

export default async function SettingsLayout({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen bg-background" data-testid="settings-layout">
      <div className="xl:container px-2 sm:px-8 mx-auto py-8">
        <h1 className="sr-only">Settings</h1>
        <div className="flex flex-row gap-8">
          <nav className="w-64 space-y-2">
            {SettingsNavRoutes.map((item) => (
              <SideNavItem
                key={item.name}
                item={item}
              />
            ))}
          </nav>
          <main className="flex-1 bg-card rounded-lg shadow-sm p-6">
            <Suspense 
              fallback={<LoaderV1 message="Loading..." cloudSize={24} duration={1.5} delay={0.2} fallbackUrl="/" />}
            >
              {children}
            </Suspense>
          </main>
        </div>
      </div>
    </div>
  );
}
