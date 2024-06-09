'use client';
import { NavItemChild } from '@components/navs/types';
import { SquareDashedBottomCodeIcon, SquareLibraryIcon } from 'lucide-react';

export const MineNavRoutes: NavItemChild[] = [
  {
    name: 'Collections',
    href: '/mine/collections',
    icon: SquareLibraryIcon
  },
  {
    name: 'Functions',
    href: '/mine/functions',
    icon: SquareDashedBottomCodeIcon
  }
];
