type NavItemBase = {
  name: string;
  description?: string;
  current: boolean;
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
    current: true,
  },
  {
    name: 'Tasks',
    description: 'Central hub for managing tasks, including to-dos, reminders, and project assignments.',
    current: false,
    children: [
      {
        name: 'My Tasks',
        description: 'Displays a comprehensive list of your current tasks, allowing for management and tracking.',
        current: false,
        href: '/tasks/my-tasks',
      },
      {
        name: 'New Task',
        description: 'Create a new task, specifying details such as title, deadline, and priority.',
        current: false,
        href: '/tasks/new',
      },
    ],
  },
  {
    name: 'Calendar',
    description: 'Manage and view your calendar for scheduling and tracking events, appointments, and deadlines.',
    current: false,
    children: [
      {
        name: 'View Calendar',
        description: 'Displays your calendar with all scheduled events and activities.',
        current: false,
        href: '/calendar/view',
      },
      {
        name: 'Add Event',
        description: 'Create a new event or appointment in your calendar.',
        current: false,
        href: '/calendar/add',
      },
    ],
  },
  {
    name: 'Notes',
    description: 'A secure place for writing, organizing, and storing your personal and work notes.',
    current: false,
    children: [
      {
        name: 'My Notes',
        description: 'Access and manage your collection of notes.',
        current: false,
        href: '/notes/my-notes',
      },
      {
        name: 'New Note',
        description: 'Create a new note.',
        current: false,
        href: '/notes/new',
      },
    ],
  },
  {
    name: 'Projects',
    description: 'Project management tools for tracking progress, collaboration, and resources.',
    current: false,
    children: [
      {
        name: 'Project Dashboard',
        description: 'Overview of current projects including status, timelines, and team members.',
        current: false,
        href: '/projects/dashboard',
      },
      {
        name: 'Create Project',
        description: 'Initiate a new project, defining its scope, team, and milestones.',
        current: false,
        href: '/projects/create',
      },
    ],
  }
];

// export const UserNavs: NavItem[] = [
//   {
//     name: 'Settings',
//     description: 'Configure your account settings, preferences, and integrations.',
//     current: false,
//     children: [
//       {
//         name: 'Profile',
//         description: 'Edit your profile information, including name, email, and password.',
//         current: false,
//         href: '/settings/profile',
//       },
//       {
//         name: 'Integrations',
//         description: 'Manage integrations with other services and applications.',
//         current: false,
//         href: '/settings/integrations',
//       },
//     ],
//   }
// ];
