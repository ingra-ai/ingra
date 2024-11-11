"use client"
/**
 * Generated with reference from https://ui.shadcn.com/blocks 
 */

import { AuthUserMenu } from "@repo/components/navs/menu/AuthUserMenu"
import { Logo } from "@repo/components/navs/navbar"
import { ModeToggle } from "@repo/components/theme/theme-toggle"
import { buttonVariants } from "@repo/components/ui/button"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from "@repo/components/ui/sidebar"
import { AuthSessionResponse } from "@repo/shared/data/auth/session/types"
import { APP_GITHUB_URL, DOCS_APP_URL, HUBS_APP_URL, HUBS_SETTINGS_APIKEY_URI, HUBS_SETTINGS_ENVVARS_URI, HUBS_SETTINGS_INTEGRATIONS_URI, HUBS_SETTINGS_PROFILE_URI } from "@repo/shared/lib/constants"
import { getUserRepoUri } from "@repo/shared/lib/constants/repo"
import {
  Book,
  Folder,
  GithubIcon,
  ShoppingBag,
} from "lucide-react"
import * as React from "react"

import { NavSecondary } from ".//nav-secondary"
import { NavHistories } from "./nav-histories"

const generateNavLinks = (authSession?: AuthSessionResponse) => {
  const NAVLINKS = [
    {
      title: 'Marketplace',
      description: 'Browse public collections and functions shared by other users.',
      url: HUBS_APP_URL + '/marketplace/collections',
      icon: ShoppingBag
    },
    {
      title: 'Docs',
      description: 'Learn how to use the platform and its features.',
      url: DOCS_APP_URL,
      icon: Book
    }
  ];

  if (authSession?.user?.profile?.userName) {
    NAVLINKS.splice(1, 0, {
      title: 'Repository',
      description: 'Manage your collections and functions that you own or have access to.',
      url: HUBS_APP_URL + getUserRepoUri(authSession.user.profile.userName),
      icon: Folder
    });
  }

  return NAVLINKS;
};

const generateAuthNavLinks = (authSession?: AuthSessionResponse) => {
  if (!authSession) return [];

  const NAVLINKS = [
    {
      title: 'Profile',
      href: HUBS_SETTINGS_PROFILE_URI
    },
    {
      title: 'Integrations',
      href: HUBS_SETTINGS_INTEGRATIONS_URI
    },
    {
      title: 'API',
      href: HUBS_SETTINGS_APIKEY_URI
    },
    {
      title: 'Environment Variables',
      href: HUBS_SETTINGS_ENVVARS_URI
    }
  ]

  return NAVLINKS;
};

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  authSession?: AuthSessionResponse;
}

export function AppSidebar(props: AppSidebarProps) {
  const { authSession, ...restOfProps } = props;

  return (
    <Sidebar variant="inset" {...restOfProps}>
      <SidebarHeader>
        <SidebarMenu>
          <div className="flex items-center justify-between">
            <Logo />
            <SidebarMenuItem className="flex items-center justify-center">
              <a href={APP_GITHUB_URL} className={buttonVariants({ variant: 'ghost', size: 'icon' })} target="_blank" rel="noopener noreferrer">
                <GithubIcon className="h-[1.1rem] w-[1.1rem]" />
              </a>
              <ModeToggle />
            </SidebarMenuItem>
          </div>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {/* <NavMain items={data.navMain} /> */}
        {/* <NavProjects projects={generateNavLinks(authSession)} /> */}
        {
          authSession && (
            <NavHistories authSession={authSession} />
          )
        }
        <NavSecondary items={generateNavLinks(authSession)} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <AuthUserMenu authSession={authSession} showUsername={true} navlinks={generateAuthNavLinks(authSession)} />
      </SidebarFooter>
    </Sidebar>
  )
}