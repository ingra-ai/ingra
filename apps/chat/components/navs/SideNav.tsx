'use client';
import { AuthUserMenu } from '@repo/components/navs/menu/AuthUserMenu';
import { Logo, NavMenu } from '@repo/components/navs/navbar';
import { Navlink } from '@repo/components/navs/types';
import { ModeToggle } from '@repo/components/theme/theme-toggle';
import { Button, buttonVariants } from '@repo/components/ui/button';
import { ScrollArea } from '@repo/components/ui/scroll-area';
import { AuthSessionResponse } from '@repo/shared/data/auth/session/types';
import { APP_GITHUB_URL } from '@repo/shared/lib/constants';
import { cn } from '@repo/shared/lib/utils';
import { GithubIcon, MenuIcon } from 'lucide-react';
import Link from 'next/link';

import type { FC, PropsWithChildren } from 'react';

export type SideNavProps = {
  className?: string;
  authSession?: AuthSessionResponse;
  authNavlinks: Navlink[];
  navlinks: Navlink[];
  onMenuClick?: () => void;
};

const SideNav: FC<PropsWithChildren<SideNavProps>> = (props) => {
  const { className, navlinks = [], authSession, authNavlinks, onMenuClick, children } = props;
  const classes = cn('px-2.5 py-2', className);

  return (
    <nav className={classes} data-testid='sidenav'>
      <div className="flex items-center mb-5">
        <div className="w-full p-2">
          <Logo className="h-6 w-auto" />
        </div>
        {
          typeof onMenuClick === 'function' && (
            <Button onClick={ onMenuClick } variant={'outline'} className="p-2 w-auto h-auto">
              <span className="sr-only">Toggle sidebar</span>
              <MenuIcon className="w-4 h-4" />
            </Button>
          )
        }
      </div>
      <ScrollArea className="flex flex-col gap-4">
        <div className="flex flex-col gap-2.5">
          <NavMenu navlinks={navlinks} />
        </div>
        {children}
      </ScrollArea>
      <div className="mt-auto space-y-1">
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center">
            <AuthUserMenu showUsername={true} authSession={authSession} navlinks={authNavlinks} />
          </div>
          <div className="flex items-center justify-center">
            <Link href={APP_GITHUB_URL} className={buttonVariants({ variant: 'ghost', size: 'icon' })}>
              <GithubIcon className="h-[1.1rem] w-[1.1rem]" />
            </Link>
            <ModeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default SideNav;