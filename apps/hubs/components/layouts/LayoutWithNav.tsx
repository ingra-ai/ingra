'use client';
import { AuthUserMenu } from '@repo/components/navs/menu/AuthUserMenu';
import { BreadcrumbNav } from '@repo/components/navs/menu/BreadcrumbNav';
import { Navbar } from '@repo/components/navs/navbar';
import { Navlink } from '@repo/components/navs/types';
import { CHAT_APP_URL, DOCS_APP_URL, HUBS_SETTINGS_APIKEY_URI, HUBS_SETTINGS_ENVVARS_URI, HUBS_SETTINGS_INTEGRATIONS_URI, HUBS_SETTINGS_PROFILE_URI } from '@repo/shared/lib/constants';
import { getUserRepoCollectionsUri } from '@repo/shared/lib/constants/repo';
import { cn } from '@repo/shared/lib/utils';
import { usePathname } from 'next/navigation';
import { type DetailedHTMLProps, type HTMLAttributes, useState, type FC, type PropsWithChildren } from 'react';

import { generateBreadcrumbItems } from './generateBreadcrumbItems';

import type { AuthSessionResponse } from '@repo/shared/data/auth/session/types';


type NavbarProps = DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> & {
  authSession?: AuthSessionResponse;
  className?: string;
};

const generateNavLinks = (authSession?: AuthSessionResponse) => {
  const NAVLINKS: Navlink[] = [
    {
      title: 'Marketplace',
      description: 'Browse public collections and functions shared by other users.',
      href: '/marketplace/collections'
    },
    {
      title: 'Overview',
      description: 'Provides a summary of user activities, including usage metrics of various utilities and services.',
      href: '/overview/dashboard'
    },
    /*
    {
      title: 'Chat',
      description: 'Chat with the AI assistant.',
      href: CHAT_APP_URL
    },
    */
    {
      title: 'Docs',
      description: 'Learn how to use the platform and its features.',
      href: DOCS_APP_URL,
      external: true
    }
  ];

  if (authSession?.user?.profile?.userName) {
    NAVLINKS.splice(1, 0, {
      title: 'Repository',
      description: 'Manage your collections and functions that you own or have access to.',
      href: getUserRepoCollectionsUri(authSession.user.profile.userName)
    });
  }

  return NAVLINKS;
}

const generateAuthNavLinks = (authSession?: AuthSessionResponse) => {
  const NAVLINKS: Navlink[] = [
    {
      title: 'Profile',
      href: HUBS_SETTINGS_PROFILE_URI,
    },
    {
      title: 'Integrations',
      href: HUBS_SETTINGS_INTEGRATIONS_URI,
    },
    {
      title: 'API',
      href: HUBS_SETTINGS_APIKEY_URI,
    },
    {
      title: 'Environment Variables',
      href: HUBS_SETTINGS_ENVVARS_URI,
    }
  ]

  return NAVLINKS;
};

export const LayoutWithNav: FC<PropsWithChildren<NavbarProps>> = (props) => {
  const { className, authSession, children, ...restOfDivProps } = props;
  const pathname = usePathname();
  const classes = cn('relative pb-64', className);

  const mainClasses = cn('relative z-20 overflow-y-auto px-2 sm:px-0', 'transition-padding duration-300 ease-in-out', {
  });

  return (
    <div className={classes} data-testid="layout-with-nav" {...restOfDivProps}>
      <Navbar
        navlinks={generateNavLinks(authSession)}
        sheetChildren={undefined}
        authChildren={(
          <AuthUserMenu authSession={authSession} navlinks={generateAuthNavLinks(authSession)} />
        )}
      >
        <div data-testid='hubs-menu' className=''>
        </div>
      </Navbar>

      <BreadcrumbNav
        className="py-2 my-4 xl:container px-2 sm:px-8"
        items={ generateBreadcrumbItems(pathname, authSession) } 
      />

      <main className={mainClasses}>{children}</main>
    </div>
  );
};

export default LayoutWithNav;
