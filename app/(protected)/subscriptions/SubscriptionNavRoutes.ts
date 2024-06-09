'use client';
import { NavItemChild } from '@components/navs/types';
import { SquareDashedBottomCodeIcon, SquareLibraryIcon } from 'lucide-react';

export const SubscriptionNavRoutes: NavItemChild[] = [
  {
    name: 'Collections',
    href: '/subscriptions/collections',
    icon: SquareLibraryIcon
  },
  {
    name: 'Functions',
    href: '/subscriptions/functions',
    icon: SquareDashedBottomCodeIcon
  }
];
