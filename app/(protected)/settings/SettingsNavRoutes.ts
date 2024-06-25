import { NavItemChild } from '@components/navs/types';

export const SettingsNavRoutes: Omit<NavItemChild, 'icon'>[] = [
  {
    name: 'Profile',
    href: '/settings/profile',
  },
  {
    name: 'Integrations',
    href: '/settings/integrations',
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
