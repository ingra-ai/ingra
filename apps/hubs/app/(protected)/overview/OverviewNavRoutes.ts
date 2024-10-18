'use client';
import { LayoutDashboardIcon, BracesIcon } from 'lucide-react';

import { NavItemChild } from '@/components/navs/types';

export const OverviewNavRoutes: NavItemChild[] = [
  {
    name: 'Dashboard',
    href: '/overview/dashboard',
    icon: LayoutDashboardIcon,
  },
  {
    name: 'Open API',
    href: '/overview/openapi',
    icon: BracesIcon,
  },
];
