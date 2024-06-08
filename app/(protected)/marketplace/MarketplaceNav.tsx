'use client';

import React from 'react';
import { NavItemChild } from '@components/navs/types';
import { SquareDashedBottomCodeIcon, SquareLibraryIcon } from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@lib/utils';

export const MarketplaceNavRoutes: NavItemChild[] = [
  {
    name: 'Collections',
    href: '/marketplace/collections',
    icon: SquareLibraryIcon
  },
  {
    name: 'Functions',
    href: '/marketplace/functions',
    icon: SquareDashedBottomCodeIcon
  }
];

type MarketplaceNavProps = React.HTMLAttributes<HTMLElement>;

const MarketplaceNav: React.FC<MarketplaceNavProps> = ( props ) => {
  const { className, ...navProps } = props;
  const pathname = usePathname();
  const classes = cn('flex overflow-x-auto', className);

  return (
    <nav className={classes} { ...navProps } data-testid="marketplace-nav">
      <ul role="list" className="flex min-w-full flex-none gap-x-6 text-sm font-semibold leading-6 text-gray-400">
        {MarketplaceNavRoutes.map((item) => (
          <li key={item.name}>
            <Link href={item.href} className={pathname.indexOf(item.href) >= 0 ? 'text-indigo-400' : ''}>
              <item.icon className="w-4 h-4 inline-block mr-2" />
              <span> {item.name} </span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default MarketplaceNav;