'use client';
import { LogOutIcon } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@lib/utils';
import { censorEmail } from '@lib/functions/censorEmail';
import { useCallback } from 'react';
import Link from 'next/link';
import { AuthSessionResponse } from "@app/auth/session/types";
import { usePathname } from 'next/navigation';
import { Profile } from '@prisma/client';
import type { NavItem, NavItemParent } from '@components/navs/types';
import { BookCheckIcon, GlobeIcon, WorkflowIcon, SquareDashedBottomCodeIcon } from 'lucide-react';
import {
  ChartBarSquareIcon
} from '@heroicons/react/24/outline'

export type SideNavProps = {
  authSession: AuthSessionResponse;
};

export const sideNavRoutes: NavItem[] = [
  {
    name: 'Overview',
    description: 'Provides a summary of user activities, including usage metrics of various utilities and services.',
    href: '/overview',
    icon: ChartBarSquareIcon,
  },
  // {
  //   name: 'Tasks',
  //   description: 'Central hub for managing tasks, including to-dos, reminders, and project assignments.',
  //   href: '/tasks',
  //   icon: BookCheckIcon,
  // },
  {
    name: "Hubs",
    description: "Dynamic hubs that your AI can perform, including text generation, summarization, and more.",
    children: [
      {
        name: 'Marketplace',
        description: 'Browse public functions shared by other users.',
        href: '/functions/marketplace',
        icon: GlobeIcon,
      },
      {
        name: 'My Functions',
        description: 'Access and manage your collection of functions repository.',
        href: '/functions/list',
        icon: SquareDashedBottomCodeIcon,
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

const SideNav: React.FC<SideNavProps> = (props) => {
  const { authSession } = props;
  const userProfile: Profile | null = authSession.user.profile;
  const [censoredUser, censoredEmail] = censorEmail(authSession?.user?.email || 'unknown@unknown.com');
  const pathname = usePathname();

  // Type guard to determine if a NavItem is a NavItemParent
  const isNavItemParent = useCallback((item: NavItem): item is NavItemParent => {
    const isParent = Object.prototype.hasOwnProperty.call(item, 'children');
    return isParent;
  }, []);

  return (
    <div className="flex grow flex-col gap-y-2 overflow-y-auto border-r border-gray-700 bg-gray-900 px-6 py-2 h-full">
      <div className="flex h-20 shrink-0 items-center">
        <Image src="/static/brand/bakabit-white-logo-only.svg" width={50} height={50} className="h-10 w-auto" alt="Bakabit Logo" />
        <h1 className="text-white text-lg font-semibold ml-2">Baka Hub</h1>
      </div>
      <nav className="flex flex-1 flex-col">
        <ul role="list" className="flex flex-1 flex-col gap-y-7">

          <li>
            <ul role="list" className="-mx-2 space-y-2">
              {sideNavRoutes.map((item) => {
                const isParent = isNavItemParent(item);
                return (
                  <li key={item.name}>
                    {isParent ? (
                      <div className="block">
                        <div className="flex items-center text-xs font-semibold leading-6 text-gray-400">
                          <span className="truncate">{item.name}</span>
                          <hr className="flex-1 border-gray-700 ml-3" />
                        </div>
                        <ul role="list" className="-mx-2 mt-2 space-y-1">
                          {
                            item.children.map((subItem) => (
                              <li className="" key={subItem.name}>
                                <Link
                                  href={subItem.href}
                                  className={cn(
                                    subItem.href === pathname ?
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
                      <div className="text-xs font-semibold leading-6 text-gray-400 -mx-2">
                        <Link
                          href={item.href}
                          className={cn(
                            item.href === pathname ?
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
          <li className="-mx-6 mt-auto">
            <ul role="list" className="space-y-1">
              <li>
                <div className="flex justify-between items-center max-w-full px-2 py-4">
                  <div className="">
                    <Link href="/settings/profile" prefetch={true} className="flex items-center gap-x-4 text-sm font-semibold leading-4" title="Profile">
                      <Image src={`https://ui-avatars.com/api?size=32&name=${censoredUser}`} width={32} height={32} className="h-8 w-8 rounded-full bg-gray-50" alt="user avatar" />
                      <span className="sr-only">Your profile</span>
                      <span className="truncate" aria-hidden="true">{userProfile?.userName || censoredEmail}</span>
                    </Link>
                  </div>
                  <a href="/auth/logout" className=" flex items-center text-sm font-semibold leading-6 h-10 px-3" title="Logout">
                    <LogOutIcon size={21} style={{ transform: 'rotate(180deg)' }} />
                    <span className="sr-only">Logout</span>
                  </a>
                </div>
              </li>
            </ul>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default SideNav;
