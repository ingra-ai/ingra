import { NavItemChild } from "@/components/navs/types";
import {
  APP_SETTINGS_PROFILE_URI,
  APP_SETTINGS_INTEGRATIONS_URI,
  APP_SETTINGS_API_URI,
  APP_SETTINGS_ENV_VARS_URI,
} from "@repo/shared/lib/constants";

export const SettingsNavRoutes: Omit<NavItemChild, "icon">[] = [
  {
    name: "Profile",
    href: APP_SETTINGS_PROFILE_URI,
  },
  {
    name: "Integrations",
    href: APP_SETTINGS_INTEGRATIONS_URI,
  },
  {
    name: "API",
    href: APP_SETTINGS_API_URI,
  },
  {
    name: "Environment Variables",
    href: APP_SETTINGS_ENV_VARS_URI,
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
