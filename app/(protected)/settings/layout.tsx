import { PropsWithChildren } from 'react';
import { SettingsNavRoutes } from '@protected/settings/SettingsNavRoutes';
import TopSubNav from '@components/navs/TopSubNav';

export default async function SettingsLayout({ children }: PropsWithChildren) {
  return (
    <div className="" data-testid='settings-layout'>
      <h1 className="sr-only">Settings</h1>

      <header className="border-b border-white/5">
        {/* Secondary navigation */}
        <TopSubNav navItems={SettingsNavRoutes} />
      </header>
  
      <div className="">
        {children}
      </div>
    </div>
  );
}
