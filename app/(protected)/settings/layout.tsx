import { PropsWithChildren } from 'react';
import { headers } from 'next/headers';
import { NavItemChild } from '@components/navs/types';

export const SettingsNavRoutes: Omit<NavItemChild, 'icon'>[] = [
  {
    name: 'Profile',
    href: '/settings/profile',
  },
  {
    name: 'GPT Plugins',
    href: '/settings/gpt-plugins',
  },
  {
    name: "Integrations",
    href: '/settings/integrations',
  }
  // {
  //   name: 'Billing',
  //   href: '#',
  // },
  // {
  //   name: 'Teams',
  //   href: '#',
  // },
  // {
  //   name: 'Integrations',
  //   href: '#',
  // },
];

export default async function SettingsLayout({ children }: PropsWithChildren) {
  const pathname = headers().get('x-next-pathname') as string;

  return (
    <div className="" data-testid='settings-layout'>
      <h1 className="sr-only">Settings</h1>

      <header className="border-b border-white/5">
        {/* Secondary navigation */}
        <nav className="flex overflow-x-auto">
          <ul role="list" className="flex min-w-full flex-none gap-x-6 text-sm font-semibold leading-6 text-gray-400">
            {SettingsNavRoutes.map((item) => (
              <li key={item.name}>
                <a href={item.href} className={item.href === pathname ? 'text-indigo-400' : ''}>
                  {item.name}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </header>
  
      <div className="">
        {children}
      </div>
    </div>
  );
}
