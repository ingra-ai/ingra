
import Image from 'next/image';
import { Fragment } from 'react';
import Link from 'next/link';
import { censorEmail } from '@repo/shared/lib/utils';
import { Transition, Menu, MenuSection, MenuButton, MenuItems, MenuItem, MenuHeading, MenuSeparator } from '@headlessui/react';
import { ChevronDown, LogIn } from 'lucide-react';
import { AuthSessionResponse } from "@repo/shared/data/auth/session/types";
import { Button } from '@repo/components/ui/button';
import { APP_AUTH_LOGIN_URL, AUTH_APP_URL } from '@repo/shared/lib/constants';
import type { Navlink } from '../types';
import { Avatar, AvatarFallback } from '../../ui/avatar';

type AuthUserMenuProps = {
  authSession?: AuthSessionResponse;
  navlinks?: Navlink[];
}

export function AuthUserMenu(props: AuthUserMenuProps) {
  const {
    authSession,
    navlinks = [],
  } = props;

  if (!authSession) {
    if (typeof window !== 'undefined') {
      const loginHref = [APP_AUTH_LOGIN_URL, '?redirectTo=', encodeURIComponent(window.location.href)].join('');

      return (
        <Button
          asChild
          variant={'link'}
          className="flex items-center space-x-2 px-3 py-2 text-sm font-medium"
        >
          <a href={loginHref} className="flex font-semibold space-x-2 px-3 py-3 text-xs" title="Sign In">
            <LogIn className="w-4 h-4" />
            <span className="">Sign In</span>
          </a>
        </Button>
      );
    }
    else {
      return null;
    }
  }

  const [censoredUser, censoredEmail] = censorEmail(authSession?.user?.email || 'unknown@unknown.com');
  const avatarFallbackText = (authSession?.user.profile.userName || authSession?.user?.email).slice(0, 2).toUpperCase();
  const logoutUrl = [AUTH_APP_URL, '/logout'].join('');

  return (
    <Menu as="div" className="relative">
      <MenuButton className="flex w-full items-center text-sm focus:outline-none p-2 cursor-pointer">
        <Avatar className="h-8 w-8">
          <AvatarFallback>{avatarFallbackText}</AvatarFallback>
        </Avatar>
        <ChevronDown className="ml-1 w-4 h-4" />
      </MenuButton>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <MenuItems className="absolute bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 mt-2 rounded-md py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none bottom-full h-[290px] z-50" anchor="bottom end">
          <MenuSection>
            <MenuHeading className="px-4 pt-3">
              <p className="text-xs">You&apos;re signed in as</p>
              <p className="text-xs font-semibold leading-8">{authSession?.user?.email}</p>
            </MenuHeading>
            <MenuSeparator className="my-1 h-px bg-gray-700" />
            {navlinks.map((item) => (
              <MenuItem key={item.title}>
                <Link href={item.href} className="flex font-semibold space-x-2 px-4 py-3 text-xs hover:bg-gray-300 dark:hover:bg-gray-700" title={item.title}>
                  <span className="">{item.title}</span>
                </Link>
              </MenuItem>
            ))}
          </MenuSection>
          <MenuSeparator className="my-1 h-px mt-auto bg-gray-700" />
          <MenuItem>
            <a href={logoutUrl} className="flex font-semibold space-x-2 px-4 py-3 text-xs text-destructive hover:bg-gray-300 dark:hover:bg-gray-700" title="Logout">
              <span className="">Logout</span>
            </a>
          </MenuItem>
        </MenuItems>
      </Transition>
    </Menu>
  );
}