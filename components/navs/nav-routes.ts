type NavItemBase = {
  name: string;
  description?: string;
}

export type NavItemChild = NavItemBase & {
  href: string;
}

export type NavItemParent = NavItemBase & {
  children: NavItemChild[];
}

export type NavItem = NavItemParent | NavItemChild;

export const NavRoutes: NavItem[] = [
  {
    name: 'Overview',
    description: 'Provides a summary of user activities, including usage metrics of various utilities and services.',
    href: '/overview',
  },
  {
    name: 'Tasks',
    description: 'Central hub for managing tasks, including to-dos, reminders, and project assignments.',
    href: '/tasks'
  },
  {
    name: 'Calendar',
    description: 'Manage and view your calendar for scheduling and tracking events, appointments, and deadlines.',
    children: [
      {
        name: 'View Calendar',
        description: 'Displays your calendar with all scheduled events and activities.',
        href: '/calendar/view',
      },
      {
        name: 'Add Event',
        description: 'Create a new event or appointment in your calendar.',
        href: '/calendar/add',
      },
    ],
  },
  // {
  //   name: 'Notes',
  //   description: 'A secure place for writing, organizing, and storing your personal and work notes.',
  //   children: [
  //     {
  //       name: 'My Notes',
  //       description: 'Access and manage your collection of notes.',
  //       href: '/notes/my-notes',
  //     },
  //     {
  //       name: 'New Note',
  //       description: 'Create a new note.',
  //       href: '/notes/new',
  //     },
  //   ],
  // },
  // {
  //   name: 'Projects',
  //   description: 'Project management tools for tracking progress, collaboration, and resources.',
  //   children: [
  //     {
  //       name: 'Project Dashboard',
  //       description: 'Overview of current projects including status, timelines, and team members.',
  //       href: '/projects/dashboard',
  //     },
  //     {
  //       name: 'Create Project',
  //       description: 'Initiate a new project, defining its scope, team, and milestones.',
  //       href: '/projects/create',
  //     },
  //   ],
  // }
];

export type SettingsNavItem = NavItemChild;

export const SettingsNavRoutes: SettingsNavItem[] = [
  {
    name: 'Profile',
    href: '/settings/profile',
  },
  {
    name: 'GPT Plugins',
    href: '/settings/gpt-plugins',
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
]

// export const UserNavs: NavItem[] = [
//   {
//     name: 'Settings',
//     description: 'Configure your account settings, preferences, and integrations.',
//     children: [
//       {
//         name: 'Profile',
//         description: 'Edit your profile information, including name, email, and password.',
//         href: '/settings/profile',
//       },
//       {
//         name: 'Integrations',
//         description: 'Manage integrations with other services and applications.',
//         href: '/settings/integrations',
//       },
//     ],
//   }
// ];
