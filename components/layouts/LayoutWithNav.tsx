'use client';
import { useState, type FC, type PropsWithChildren } from 'react';
import { Transition, TransitionChild } from '@headlessui/react';
import type { AuthSessionResponse } from '@app/auth/session/types';
import SideNav from '../navs/SideNav';
import { cn } from '@lib/utils';
import { MenuIcon } from 'lucide-react';
import { Button } from '@components/ui/button';

type NavbarProps = {
  authSession: AuthSessionResponse;
  className?: string;
};

export const LayoutWithNav: FC<PropsWithChildren<NavbarProps>> = (props) => {
  const {
    className,
    authSession,
    children
  } = props;
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const classes = cn(
    'min-h-screen',
    className
  );

  const mainClasses = cn(
    'bg-dark-radial-pattern',
    'relative z-20 min-h-screen',
    'transition-padding duration-300 ease-in-out',
    {
      'lg:pl-64': sidebarOpen
    }
  );

  return (
    <div className={classes} data-testid='layout-with-nav'>
      <div className="fixed z-30 left-0 top-0 flex flex-1 p-2">
        {/* Mobile sidenav toggler */}
        <div className="flex items-center gap-x-2">
          <Button onClick={ () => setSidebarOpen(true) } variant={'outline'} className="p-2 w-auto h-auto">
            <span className="sr-only">Toggle sidebar</span>
            <MenuIcon className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      <div className='lg:visible lg:inset-y-0 lg:flex lg:w-64 lg:flex-col'>
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
                    <SideNav authSession={authSession} onMenuClick={() => setSidebarOpen(false)} className='bg-card border-r border-gray-700 flex flex-1 flex-col overflow-x-hidden' />
                  </TransitionChild>
                </div>
              </TransitionChild>
            </div>
          </Transition>
        </div>
      </div>
      <main className={ mainClasses }>
        <div className="p-4" data-testid="wrapper">
          {children}
        </div>
      </main>
    </div>
  );
};

export default LayoutWithNav;