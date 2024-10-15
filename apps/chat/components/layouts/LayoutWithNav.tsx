'use client';
import { Transition, TransitionChild } from '@headlessui/react';
import { Navlink } from '@repo/components/navs/types';
import { Button } from '@repo/components/ui/button';
import { Separator } from '@repo/components/ui/separator';
import { DOCS_APP_URL, HUBS_APP_URL, HUBS_SETTINGS_APIKEY_URI, HUBS_SETTINGS_ENVVARS_URI, HUBS_SETTINGS_INTEGRATIONS_URI, HUBS_SETTINGS_PROFILE_URI } from '@repo/shared/lib/constants';
import { getUserRepoUri } from '@repo/shared/lib/constants/repo';
import { cn } from '@repo/shared/lib/utils';
import { MenuIcon } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { type DetailedHTMLProps, type HTMLAttributes, useState, type FC, type PropsWithChildren } from 'react';

import { History } from '../custom/history';
import SideNav from '../navs/SideNav';

import type { AuthSessionResponse } from '@repo/shared/data/auth/session/types';


type NavbarProps = DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> & {
  authSession?: AuthSessionResponse;
  className?: string;
};

const generateNavLinks = (authSession?: AuthSessionResponse) => {
  const NAVLINKS: Navlink[] = [
    {
      title: 'Marketplace',
      description: 'Browse public collections and functions shared by other users.',
      href: HUBS_APP_URL + '/marketplace/collections'
    },
    {
      title: 'Docs',
      description: 'Learn how to use the platform and its features.',
      href: DOCS_APP_URL,
      external: true
    }
  ];

  if (authSession?.user?.profile?.userName) {
    NAVLINKS.splice(1, 0, {
      title: 'Repository',
      description: 'Manage your collections and functions that you own or have access to.',
      href: getUserRepoUri(authSession.user.profile.userName)
    });
  }

  return NAVLINKS;
};

const generateAuthNavLinks = (authSession?: AuthSessionResponse) => {
  const NAVLINKS: Navlink[] = [
    {
      title: 'Profile',
      href: HUBS_SETTINGS_PROFILE_URI,
    },
    {
      title: 'Integrations',
      href: HUBS_SETTINGS_INTEGRATIONS_URI,
    },
    {
      title: 'API',
      href: HUBS_SETTINGS_APIKEY_URI,
    },
    {
      title: 'Environment Variables',
      href: HUBS_SETTINGS_ENVVARS_URI,
    }
  ]

  return NAVLINKS;
};

export const LayoutWithNav: FC<PropsWithChildren<NavbarProps>> = (props) => {
  const { className, authSession, children, ...restOfDivProps } = props;
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const classes = cn(
    'relative h-full w-full overflow-hidden',
    className
  );
  const mainClasses = cn(
    'relative z-20 h-full w-full overflow-hidden overflow-y-auto',
    'transition-padding duration-300 ease-in-out',
    {
      'lg:pl-60': sidebarOpen
    }
  );

  return (
    <div className={classes} data-testid="layout-with-nav" {...restOfDivProps}>
    <div className="fixed z-30 left-0 top-0 flex flex-1 p-2">
      {/* Mobile sidenav toggler */}
      <div className="flex items-center gap-x-2">
        <Button onClick={ () => setSidebarOpen(true) } variant={'outline'} className="p-2 w-auto h-auto">
          <span className="sr-only">Toggle sidebar</span>
          <MenuIcon className="w-4 h-4" />
        </Button>
      </div>
    </div>
      <div className='lg:visible lg:inset-y-0 lg:flex lg:w-60 lg:flex-col'>
        <div className="relative z-30">
          <Transition show={sidebarOpen} as={'div'}>
            <TransitionChild
              as={'div'}
              className="lg:hidden"
              enter="transition-opacity ease-linear duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="transition-opacity ease-linear duration-300"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-gray-900/80" onClick={() => setSidebarOpen(false)} />
            </TransitionChild>

            <div className="fixed left-0 top-0 flex">
              <TransitionChild
                as={'div'}
                enter="transition ease-in-out duration-300 transform"
                enterFrom="-translate-x-64"
                enterTo="translate-x-0"
                leave="transition ease-in-out duration-300 transform"
                leaveFrom="translate-x-0"
                leaveTo="-translate-x-64"
              >
                <div className="flex max-w-xs flex-1 h-screen max-h-screen w-64">
                  <TransitionChild
                    as={'div'}
                    className={'flex w-64'}
                    enter="ease-in-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in-out duration-300"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    {/* Sidebar component, swap this element with another sidebar if you like */}
                    <SideNav 
                      authSession={authSession}
                      navlinks={generateNavLinks(authSession)}
                      authNavlinks={generateAuthNavLinks(authSession)}
                      onMenuClick={() => setSidebarOpen(false)}
                      className='bg-card border-r border-gray-300 dark:border-gray-700 flex flex-1 flex-col overflow-x-hidden'
                    >
                      <Separator className="my-4" />
                      <History authSession={authSession} />
                    </SideNav>
                  </TransitionChild>
                </div>
              </TransitionChild>
            </div>
          </Transition>
        </div>
      </div>
      <main className={mainClasses}>
        {children}
      </main>
    </div>
  );
};

export default LayoutWithNav;
