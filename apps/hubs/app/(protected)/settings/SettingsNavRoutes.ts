import { NavItemChild } from '@/components/navs/types';
import { HUBS_SETTINGS_PROFILE_URI, HUBS_SETTINGS_INTEGRATIONS_URI, HUBS_SETTINGS_APIKEY_URI, HUBS_SETTINGS_ENVVARS_URI } from '@repo/shared/lib/constants';

export const SettingsNavRoutes: Omit<NavItemChild, 'icon'>[] = [
  {
    name: 'Profile',
    href: HUBS_SETTINGS_PROFILE_URI,
  },
  {
    name: 'Integrations',
    href: HUBS_SETTINGS_INTEGRATIONS_URI,
  },
  {
    name: 'API',
    href: HUBS_SETTINGS_APIKEY_URI,
  },
  {
    name: 'Environment Variables',
    href: HUBS_SETTINGS_ENVVARS_URI,
  },
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
