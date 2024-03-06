import { PropsWithChildren } from "react";
import { SettingsNavRoutes } from '@/components/navs/nav-routes';
import { headers } from "next/headers";

export default async function SettingsLayout({ children }: PropsWithChildren) {
  const pathname = headers().get('x-next-pathname') as string;

  return (
    <div className="xl:pl-52 2xl:pl-72">
      <h1 className="sr-only">Account Settings</h1>

      <header className="border-b border-white/5">
        {/* Secondary navigation */}
        <nav className="flex overflow-x-auto py-4">
          <ul
            role="list"
            className="flex min-w-full flex-none gap-x-6 px-4 text-sm font-semibold leading-6 text-gray-400 sm:px-6 lg:px-8"
          >
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

      {children}
    </div>
  );
};
