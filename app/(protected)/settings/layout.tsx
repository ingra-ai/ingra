import { PropsWithChildren, Suspense } from 'react';
import { SettingsNavRoutes } from '@protected/settings/SettingsNavRoutes';
import TopSubNav from '@components/navs/TopSubNav';
import { APP_NAME } from '@lib/constants';
import type { Metadata } from 'next'
 
export const metadata: Metadata = {
  title: ['Settings', APP_NAME].join(' | '),
}

export default async function SettingsLayout({ children }: PropsWithChildren) {
  return (
    <div className="" data-testid='settings-layout'>
      <h1 className="sr-only">Settings</h1>

      <header className="">
        {/* Secondary navigation */}
        <TopSubNav navItems={SettingsNavRoutes} />
      </header>
  
      <div className="">
        <Suspense fallback={<div>Loading...</div>}>
          {children}
        </Suspense>
      </div>
    </div>
  );
}
