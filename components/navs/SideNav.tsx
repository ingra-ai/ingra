'use client';
import type { FC } from 'react';
import { cn } from '@lib/utils';
import { useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { NavItem, NavItemParent } from '@components/navs/types';
import { GlobeIcon, SquareDashedBottomCodeIcon, RssIcon, BotMessageSquareIcon, UserCogIcon } from 'lucide-react';
import { ChartBarSquareIcon } from '@heroicons/react/24/outline'

export type SideNavProps = {
  className?: string;
};

export const sideNavRoutes: NavItem[] = [
  {
    name: 'Overview',
    description: 'Provides a summary of user activities, including usage metrics of various utilities and services.',
    href: '/overview',
    icon: ChartBarSquareIcon,
  },
  {
    name: 'Assistant',
    description: 'Chat with your AI assistant, to get help with interacting with your available automations.',
    href: '/assistant',
    icon: BotMessageSquareIcon,
  },
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
        name: 'Subscriptions',
        description: 'Manage your collections and functions that you subscribed from Marketplace.',
        href: '/subscriptions',
        icon: RssIcon,
      },
      {
        name: 'My Automations',
        description: 'Manage your own collections and functions repository.',
        href: '/mine',
        icon: UserCogIcon,
      },
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

const SideNav: FC<SideNavProps> = (props) => {
  const { className } = props;
  const pathname = usePathname();

  // Type guard to determine if a NavItem is a NavItemParent
  const isNavItemParent = useCallback((item: NavItem): item is NavItemParent => {
    const isParent = Object.prototype.hasOwnProperty.call(item, 'children');
    return isParent;
  }, []);

  const classes = cn('flex flex-col gap-y-2 overflow-y-auto px-6 py-2 h-full', className);

  return (
    <nav className={ classes } data-testid='sidenav'>
      <ul role="list" className="flex flex-1 flex-col gap-y-7">
        <li>
          <ul role="list" className="-mx-2 space-y-2">
            {sideNavRoutes.map((item) => {
              const isParent = isNavItemParent(item);
              const hasChildren = isParent && item.children.length > 0;
              return (
                <li key={item.name}>
                  {isParent ? (
                    <div className={ cn('block', { 'mt-8': hasChildren })}>
                      <div className="flex items-center text-xs font-semibold leading-6 text-gray-400" title={item.description} aria-label={item.description}>
                        <span className="truncate">{item.name}</span>
                        <hr className="flex-1 border-gray-700 ml-3" />
                      </div>
                      <ul role="list" className="-mx-2 mt-2 space-y-1">
                        {
                          item.children.map((subItem) => (
                            <li className="" key={subItem.name} title={subItem.description} aria-label={subItem.description}>
                              <Link
                                href={subItem.href}
                                prefetch={false}
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
                    <div className="text-xs font-semibold leading-6 text-gray-400 -mx-2">
                      <Link
                        href={item.href}
                        prefetch={false}
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
        <li className="-mx-6 mt-auto">
          <ul role="list" className="space-y-1">
            <li>
            </li>
          </ul>
        </li>
      </ul>
    </nav>
  );
};

export default SideNav;
