'use client';
import type { FC } from 'react';
import { censorEmail, cn } from '@lib/utils';
import { Fragment, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { NavItem, NavItemParent } from '@components/navs/types';
import type { AuthSessionResponse } from '@app/auth/session/types';
import { GlobeIcon, Package2Icon, LayoutDashboardIcon, EllipsisIcon, MenuIcon } from 'lucide-react';
import { Transition, Menu, MenuSection, MenuButton, MenuItems, MenuItem, MenuHeading, MenuSeparator } from '@headlessui/react';
import { SettingsNavRoutes } from '@protected/settings/SettingsNavRoutes';
import { Button } from '@components/ui/button';

export type SideNavProps = {
  className?: string;
  authSession: AuthSessionResponse;
  onMenuClick?: () => void;
};

const getSideNavRoutes = (authSession: AuthSessionResponse) => {
  const username = authSession?.user?.profile?.userName || '';

  const sideNavRoutes: NavItem[] = [
    {
      name: 'Dashboard',
      description: 'Provides a summary of user activities, including usage metrics of various utilities and services.',
      href: '/overview/dashboard',
      icon: LayoutDashboardIcon,
    },
    // {
    //   name: 'Assistant',
    //   description: 'Chat with your AI assistant, to get help with interacting with your available automations.',
    //   href: '/assistant',
    //   icon: BotMessageSquareIcon,
    // },
    {
      name: "Hubs",
      description: "Dynamic hubs that your AI can utilize, including collections, functions, subscriptions, workflows and more.",
      children: [
        {
          name: 'Marketplace',
          description: 'Browse public collections and functions shared by other users.',
          href: '/marketplace',
          icon: GlobeIcon,
        },
        {
          ...( username ? {
            name: 'Repository',
            description: 'Manage your collections and functions that you own or have access to.',
            href: `/repo/${username}/collections`,
            icon: Package2Icon,
          } : {
            name: 'Repository',
            description: 'Manage your collections and functions that you own or have access to.',
            href: `/repo`,
            icon: Package2Icon,
          })
        }
      ],
    },
    // {
    //   name: "Workflows",
    //   description: "Generate workflows for automating tasks, including data processing, notifications, and more.",
    //   children: [
    //     {
    //       name: 'Your Flows',
    //       description: 'Access and manage your collection of workflows.',
    //       href: '/flows',
    //       icon: WorkflowIcon,
    //     }
    //   ],
    // },
  ];

  return sideNavRoutes;
};

const SideNav: FC<SideNavProps> = (props) => {
  const { className, authSession, onMenuClick } = props;
  const [censoredUser, censoredEmail] = censorEmail(authSession?.user?.email || 'unknown@unknown.com');
  const pathname = usePathname();
  const sideNavRoutes = getSideNavRoutes(authSession);

  // Type guard to determine if a NavItem is a NavItemParent
  const isNavItemParent = useCallback((item: NavItem): item is NavItemParent => {
    const isParent = Object.prototype.hasOwnProperty.call(item, 'children');
    return isParent;
  }, []);

  const classes = cn('px-2.5 py-2', className);

  return (
    <nav className={classes} data-testid='sidenav'>
      <div className="flex items-center mb-5">
        <div className="w-full p-2">
          <Image src="/static/brand/ingra.svg" width={50} height={50} className="h-6 w-auto" alt="Ingra Logo" />
        </div>
        {
          typeof onMenuClick === 'function' && (
            <Button onClick={ onMenuClick } variant={'outline'} className="p-2 w-auto h-auto">
              <span className="sr-only">Toggle sidebar</span>
              <MenuIcon className="w-4 h-4" />
            </Button>
          )
        }
      </div>
      <ul role="list" className="flex flex-1 flex-col gap-y-7">
        <li>
          <ul role="list" className="space-y-2">
            {sideNavRoutes.map((item) => {
              const isParent = isNavItemParent(item);
              const hasChildren = isParent && item.children.length > 0;
              return (
                <li key={item.name}>
                  {isParent ? (
                    <div className={cn('block', { 'mt-8': hasChildren })}>
                      <div className="flex items-center text-xs font-semibold leading-6 text-gray-400" title={item.description} aria-label={item.description}>
                        <span className="truncate">{item.name}</span>
                        <hr className="flex-1 border-gray-700 ml-3" />
                      </div>
                      <ul role="list" className="mt-2 space-y-1">
                        {
                          item.children.map((subItem) => (
                            <li className="" key={subItem.name} title={subItem.description} aria-label={subItem.description}>
                              <Link
                                href={subItem.href}
                                prefetch={true}
                                className={cn(
                                  pathname.indexOf(subItem.href) >= 0 ?
                                    'bg-gray-800 text-white' :
                                    'text-gray-400 hover:text-white hover:bg-gray-800', 'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold items-center'
                                )}
                              >
                                <subItem.icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                                <span className="truncate">{subItem.name}</span>
                              </Link>
                            </li>
                          ))
                        }
                      </ul>
                    </div>
                  ) : (
                    <div className="text-xs font-semibold leading-6 text-gray-400">
                      <Link
                        href={item.href}
                        prefetch={true}
                        title={item.description}
                        aria-label={item.description}
                        className={cn(
                          pathname.indexOf(item.href) >= 0 ?
                            'bg-gray-800 text-white' :
                            'text-gray-400 hover:text-white hover:bg-gray-800', 'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold items-center'
                        )}
                      >
                        <item.icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                        <span className="truncate">{item.name}</span>
                      </Link>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </li>
        <li className="mt-auto">
          <ul role="list" className="space-y-1">
            <li>
              {/* User Icon */}
              <Menu as="div" className="relative">
                <MenuButton className="flex w-full items-center text-sm focus:outline-none p-2 cursor-pointer">
                  <Image src={`https://ui-avatars.com/api?size=32&name=${censoredUser}`} width={48} height={48} className="h-8 w-8 rounded-full bg-gray-50" alt="user avatar" />
                  <div className="px-2 text-left w-full overflow-hidden">
                    { authSession?.user?.profile?.userName && <p className="leading-5 truncate">{authSession?.user?.profile?.userName}</p> }
                    <p className="text-muted-foreground text-xs truncate">{authSession?.user?.email}</p>
                  </div>
                  <EllipsisIcon className="min-w-4 w-4 h-4" />
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
                  <MenuItems className="absolute bg-gray-900 border border-gray-700 right-0 mt-2 w-48 origin-top-right rounded-md py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none bottom-full">
                    <MenuSection>
                      <MenuHeading className='px-4 pt-3'>
                        <p className="text-xs">You&apos;re signed in as</p>
                        <p className="text-xs font-semibold leading-8">{authSession?.user?.email}</p>
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
            </li>
          </ul>
        </li>
      </ul>
    </nav>
  );
};

export default SideNav;
