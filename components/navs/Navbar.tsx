'use client';
import { useState, type FC, type PropsWithChildren, Fragment, useEffect } from 'react';
import { Bars3Icon, BellIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Dialog, DialogPanel, Transition, TransitionChild, Menu, MenuSection, MenuButton, MenuItems, MenuItem, MenuHeading, MenuSeparator } from '@headlessui/react';
import { censorEmail } from '@lib/utils';
import Link from 'next/link';
import Image from 'next/image';
import type { AuthSessionResponse } from '@app/auth/session/types';
import SideNav from './SideNav';
import { cn } from '@lib/utils';
import { usePathname } from 'next/navigation';
import { Badge } from '@components/ui/badge';
import { SettingsNavRoutes } from '@protected/settings/SettingsNavRoutes';
import type { NavNotificationItem } from '@components/navs/types';

type NavbarProps = {
  authSession: AuthSessionResponse;
  navNotificationItems?: NavNotificationItem[];
  className?: string;
};

export const Navbar: FC<PropsWithChildren<NavbarProps>> = (props) => {
  const {
    className,
    authSession,
    navNotificationItems = []
  } = props;
  const [censoredUser, censoredEmail] = censorEmail(authSession?.user?.email || 'unknown@unknown.com');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const classes = cn(
    '',
    'bg-gray-900 shadow-sm border-b border-white/5',
    className
  );

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  return (
    <div className={classes} data-testid='navbar'>
      <div className='flex shrink-0 items-center gap-x-6 h-full'>
        <Transition show={sidebarOpen} as={Fragment}>
          <Dialog as="div" className="relative z-50 xl:hidden" onClose={setSidebarOpen}>
            <TransitionChild
              as={Fragment}
              enter="transition-opacity ease-linear duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="transition-opacity ease-linear duration-300"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-gray-900/80" />
            </TransitionChild>

            <div className="fixed inset-0 flex">
              <TransitionChild
                as={Fragment}
                enter="transition ease-in-out duration-300 transform"
                enterFrom="-translate-x-full"
                enterTo="translate-x-0"
                leave="transition ease-in-out duration-300 transform"
                leaveFrom="translate-x-0"
                leaveTo="-translate-x-full"
              >
                <DialogPanel className="relative flex flex-col flex-0 bg-gray-900 border-r border-gray-800 py-2 lg:py-4">
                  <TransitionChild
                    as={Fragment}
                    enter="ease-in-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in-out duration-300"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <button type="button" className="p-2.5" onClick={() => setSidebarOpen(false)}>
                      <span className="sr-only">Close sidebar</span>
                      <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                    </button>
                  </TransitionChild>
                  {/* Sidebar component, swap this element with another sidebar if you like */}
                  <SideNav className='w-[210px]' />
                </DialogPanel>
              </TransitionChild>
            </div>
          </Dialog>
        </Transition>

        <div className="flex flex-1 items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Mobile sidenav toggler */}
          <div className="flex items-center gap-x-2">
            <Image src="/static/brand/ingra.svg" width={50} height={50} className="h-8 w-auto hidden lg:block" alt="Ingra Logo" />
            <button type="button" onClick={() => setSidebarOpen(true)} className="-m-2.5 p-2.5 text-white lg:hidden">
              <span className="sr-only">Open sidebar</span>
              <Bars3Icon className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          {/* User Profile */}
          <div className="flex items-center gap-x-6">
            {/* Notification Dropdown */}
            {
              navNotificationItems.length > 0 && (
                <Menu as="div" className="relative">
                  <MenuButton className="flex items-center text-sm focus:outline-none">
                    <BellIcon className="h-5 w-5" aria-hidden="true" />
                    <Badge className="bg-red-300 px-2">{navNotificationItems.length.toLocaleString(undefined, { minimumFractionDigits: 0 })}</Badge>
                  </MenuButton>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <MenuItems className="absolute bg-gray-900 border border-gray-700 right-0 mt-2 w-96 origin-top-right rounded-md py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                      <MenuSection>
                        <MenuHeading className='px-4 pt-3'>
                          <p className="text-xs">Notifications</p>
                        </MenuHeading>
                        <MenuSeparator className="my-1 h-px bg-gray-700" />
                        {
                          navNotificationItems.map((item, idx) => (
                            <MenuItem key={idx}>
                              <Link href={item.href || '/'} className="flex font-semibold space-x-2 px-4 py-3 text-xs hover:bg-gray-700" title={ item.text }>
                                <span className="">{item.text}</span>
                              </Link>
                            </MenuItem>
                          ))
                        }
                      </MenuSection>
                    </MenuItems>
                  </Transition>
                </Menu>
              )
            }

            {/* User Icon */}
            <Menu as="div" className="relative">
              <MenuButton className="flex items-center text-sm focus:outline-none">
                <Image src={`https://ui-avatars.com/api?size=32&name=${censoredUser}`} width={32} height={32} className="h-6 w-6 rounded-full bg-gray-50" alt="user avatar" />
                <span className="sr-only">Your profile</span>
              </MenuButton>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <MenuItems className="absolute bg-gray-900 border border-gray-700 right-0 mt-2 w-48 origin-top-right rounded-md py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <MenuSection>
                    <MenuHeading className='px-4 pt-3'>
                      <p className="text-xs">You&apos;re signed in as</p>
                      <p className="text-xs font-semibold leading-8">{censoredEmail}</p>
                    </MenuHeading>
                    <MenuSeparator className="my-1 h-px bg-gray-700" />
                    {SettingsNavRoutes.map((item) => (
                      <MenuItem key={item.name}>
                        <Link href={item.href} className="flex font-semibold space-x-2 px-4 py-3 text-xs hover:bg-gray-700" title={item.name}>
                          <span className="">{item.name}</span>
                        </Link>
                      </MenuItem>
                    ))}
                  </MenuSection>
                  {/* <MenuSeparator className="my-1 h-px bg-gray-700" /> */}
                  <MenuItem>
                    <Link href="/auth/logout" className="flex font-semibold space-x-2 px-4 py-3 text-xs text-destructive hover:bg-gray-700 hover:text-destructive-foreground" title="Logout">
                      <span className="">Logout</span>
                    </Link>
                  </MenuItem>
                </MenuItems>
              </Transition>
            </Menu>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;