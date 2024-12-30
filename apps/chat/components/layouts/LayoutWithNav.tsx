'use client';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@repo/components/ui/breadcrumb"
import { Separator } from "@repo/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@repo/components/ui/sidebar"
import { cn } from '@repo/shared/lib/utils';
import { type DetailedHTMLProps, type HTMLAttributes, type FC, type PropsWithChildren } from 'react';

import { AppSidebar } from "@/components/navs/app-sidebar"

import type { AuthSessionResponse } from '@repo/shared/data/auth/session/types';


type NavbarProps = DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> & {
  authSession?: AuthSessionResponse;
  className?: string;
  defaultOpen?: boolean;
};

export const LayoutWithNav: FC<PropsWithChildren<NavbarProps>> = (props) => {
  const {
    className = 'p-4 pt-0',
    authSession,
    defaultOpen = true,
    children,
    ...restOfDivProps
  } = props;

  const containerClasses = cn(
    'flex flex-1 flex-col gap-4 justify-between items-center max-h-[calc(100svh-4rem)]',
    className
  );

  return (
    <div className={'relative h-full w-full overflow-hidden'} data-testid="layout-with-nav" {...restOfDivProps}>
      <SidebarProvider defaultOpen={defaultOpen}>
        <AppSidebar authSession={authSession} />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbPage>Chat</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>
          <div className={ containerClasses }>
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
};

export default LayoutWithNav;
