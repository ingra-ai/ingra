import { NavItemChild } from '@components/navs/types';

export const SettingsNavRoutes: Omit<NavItemChild, 'icon'>[] = [
  {
    name: 'Profile',
    href: '/settings/profile',
  },
  {
    name: 'API',
    href: '/settings/api',
  },
  {
    name: 'Environment Variables',
    href: '/settings/env-vars',
  }
  // {
  //   name: 'Billing',
  //   href: '#',
  // },
  // {
  //   name: 'Teams',
  //   href: '#',
  // },
  // {
  //   name: 'Integrations',
  //   href: '#',
  // },
];
