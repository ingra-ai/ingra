'use client';

import React from 'react';
import { NavItemChild } from '@components/navs/types';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@lib/utils';

type TopSubNavNavItem = Omit<NavItemChild, 'icon'> & {
  icon?: NavItemChild['icon'];
};

type TopSubNavProps = React.HTMLAttributes<HTMLElement> & {
  navItems: TopSubNavNavItem[]
};

const TopSubNav: React.FC<TopSubNavProps> = ( props ) => {
  const { className, navItems, ...navProps } = props;
  const pathname = usePathname();
  const classes = cn('flex overflow-x-auto', className);

  return (
    <>
      <nav className={classes} { ...navProps } data-testid="top-sub-nav">
        <ul role="list" className="flex min-w-full flex-none gap-x-6 text-sm font-semibold leading-6 text-gray-400">
          {navItems.map((item) => (
            <li key={item.name}>
              <Link href={item.href} prefetch={true} className={pathname.indexOf(item.href) >= 0 ? 'text-indigo-400' : ''}>
                {
                  !!item.icon && (
                    <item.icon className="w-4 h-4 inline-block mr-2" />
                  )
                }
                <span> {item.name} </span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <hr className="mt-2 mb-4" />
    </>
  );
};

export default TopSubNav;