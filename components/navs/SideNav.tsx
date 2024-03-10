"use client";
import { Disclosure } from '@headlessui/react'
import { ChevronRightIcon } from '@heroicons/react/20/solid'
import { LogOutIcon } from 'lucide-react';
import Image from 'next/image'
import { cn } from '@lib/utils';
import { censorEmail } from '@lib/functions/censorEmail';
import { type NavItem, type NavItemParent, NavRoutes } from '@/components/navs/nav-routes';
import { useCallback } from 'react';
import Link from 'next/link';
import { AuthSessionResponse } from '@app/auth/session';
import { usePathname } from 'next/navigation';
import { Profile } from '@prisma/client';

type SideNavProps = {
  authSession: AuthSessionResponse;
};

const SideNav: React.FC<SideNavProps> = (props) => {
  const { authSession } = props;
  const userProfile: Profile | null = authSession.user.profile;
  const [censoredUser, censoredEmail] = censorEmail(authSession?.user?.email || 'unknown@unknown.com');
  const pathname = usePathname();

  // Type guard to determine if a NavItem is a NavItemParent
  const isNavItemParent = useCallback((item: NavItem): item is NavItemParent => {
    const isParent = Object.prototype.hasOwnProperty.call(item, 'children');
    return isParent;
  }, []);

  return (
    <div className="flex grow flex-col gap-y-2 overflow-y-auto border-r border-gray-700 bg-gray-900 px-6 py-2 h-full">
      <div className="flex h-12 shrink-0 items-center">
        <Image
          src="/static/brand/bakabit-white-logo-only.svg"
          width={50}
          height={50}
          className='h-10 w-auto'
          alt="Bakabit Logo"
        />
        <h1 className="text-white text-lg font-semibold ml-2">Bakabit</h1>
      </div>
      <nav className="flex flex-1 flex-col">
        <ul role="list" className="flex flex-1 flex-col gap-y-7">
          <li>
            <ul role="list" className="-mx-2 space-y-1">
              {NavRoutes.map((item) => {
                const isParent = isNavItemParent(item);
                const isCurrentRoute = isParent ? (item as NavItemParent).children.some((child) => child.href === pathname) : false;
                return (
                  <li key={item.name}>
                    {isParent ? (
                      <Disclosure as="div" defaultOpen={isCurrentRoute}>
                        {
                          (props) => {
                            const { open } = props;
                            return (
                              <>
                                <Disclosure.Button
                                  className={cn(
                                    isCurrentRoute ? 'text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800',
                                    'flex items-center w-full text-left rounded-md p-2 gap-x-3 text-sm leading-6 font-semibold'
                                  )}
                                >
                                  <ChevronRightIcon
                                    className={cn(
                                      open ? 'rotate-90 text-gray-500' : 'text-gray-400',
                                      'h-5 w-5 shrink-0'
                                    )}
                                    aria-hidden="true"
                                  />
                                  {item.name}
                                </Disclosure.Button>
                                <Disclosure.Panel as="ul" className="mt-1 px-2">
                                  {item.children.map((subItem) => {
                                    return (
                                      <li key={subItem.name}>
                                        <Disclosure.Button
                                          as={Link}
                                          prefetch={true}
                                          href={subItem.href}
                                          className={cn(
                                            subItem.href === pathname ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800',
                                            'block rounded-md py-2 pr-2 pl-9 text-sm leading-6'
                                          )}
                                        >
                                          {subItem.name}
                                        </Disclosure.Button>
                                      </li>
                                    );
                                  })}
                                </Disclosure.Panel>
                              </>
                            );
                          }
                        }
                      </Disclosure>
                    ) : (
                      <Link
                        href={item.href}
                        prefetch={true}
                        className={cn(
                          item.href === pathname ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800',
                          'block rounded-md py-2 pr-2 pl-10 text-sm leading-6 font-semibold'
                        )}
                      >
                        {item.name}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </li>
          <li className="-mx-6 mt-auto">
            <ul role="list" className="space-y-1">
              <li>
                <div className="flex items-center">
                  <div className="flex-grow">
                    <Link
                      href="/settings/profile"
                      prefetch={true}
                      className="flex items-center gap-x-4 px-6 py-3 text-sm font-semibold leading-6 text-gray-400 hover:text-white hover:bg-black/50"
                      title="Profile"
                    >
                      <Image
                        src={`https://ui-avatars.com/api?size=32&name=${censoredUser}`}
                        width={32}
                        height={32}
                        className='h-8 w-8 rounded-full bg-gray-50'
                        alt="user avatar"
                      />
                      <span className="sr-only">Your profile</span>
                      <span aria-hidden="true">{userProfile?.userName || censoredEmail}</span>
                    </Link>
                  </div>
                  <a
                    href="/auth/logout"
                    className="flex items-center text-sm font-semibold leading-6 h-10 px-3 max-w-16 hover:bg-destructive/10 hover:text-destructive-foreground"
                    title='Logout'
                  >
                    <LogOutIcon size={21} style={{ transform: 'rotate(180deg)' }} />
                    <span className="sr-only">Logout</span>
                  </a>
                </div>
              </li>
              <li>
              </li>
            </ul>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default SideNav;