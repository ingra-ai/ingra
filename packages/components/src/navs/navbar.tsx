import { ModeToggle } from '../theme/theme-toggle';
import { GithubIcon, TwitterIcon, MoveUpRightIcon } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import Anchor from './anchor';
import { SheetLeftbar } from './leftbar';
import { buttonVariants } from '../ui/button';
import { SheetClose } from '../ui/sheet';
import { APP_GITHUB_URL, PARENT_APP_URL } from '@repo/shared/lib/constants';
import { PropsWithChildren } from 'react';
import { NavbarProps, NavMenuProps } from './types';

export function Navbar(props: PropsWithChildren<NavbarProps>) {
  const { navlinks = [], sheetChildren, children } = props;

  return (
    <nav className="w-full border-b h-16 sticky top-0 z-50 lg:px-4 px-2 backdrop-filter backdrop-blur-xl bg-opacity-5">
      <div className="sm:p-3 p-1 max-w-[1500px] mx-auto h-full flex items-center justify-between md:gap-2">
        <div className="flex items-center gap-5">
          <SheetLeftbar navlinks={navlinks}>{sheetChildren}</SheetLeftbar>
          <div className="flex items-center gap-6">
            <div className="sm:flex hidden">
              <Logo />
            </div>
            <div className="lg:flex hidden items-center gap-5 text-sm font-medium text-muted-foreground">
              <NavMenu navlinks={navlinks} />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {children}
            <div className="flex ml-2.5 sm:ml-0">
              <Link href={APP_GITHUB_URL} className={buttonVariants({ variant: 'ghost', size: 'icon' })}>
                <GithubIcon className="h-[1.1rem] w-[1.1rem]" />
              </Link>
              {/* <Link
                href="#"
                className={buttonVariants({
                  variant: 'ghost',
                  size: 'icon',
                })}
              >
                <TwitterIcon className="h-[1.1rem] w-[1.1rem]" />
              </Link> */}
              <ModeToggle />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export function Logo() {
  return (
    <Link href={PARENT_APP_URL} className="flex items-center gap-2.5">
      <Image src="/static/brand/ingra.svg" width={50} height={50} className="h-6 w-auto hidden lg:block" alt="Ingra Logo" />
      <h2 className="text-md font-bold sr-only">Ingra</h2>
    </Link>
  );
}

export function NavMenu({ navlinks, isSheet = false }: NavMenuProps) {
  return (
    <>
      {navlinks.map((item) => {
        const Comp = (
          <Anchor key={item.title + item.href} activeClassName="text-primary font-semibold" absolute className="flex items-center gap-1" href={item.href}>
            {item.title} {item.external && <MoveUpRightIcon className="w-3 h-3 align-super" strokeWidth={3} />}
          </Anchor>
        );
        return isSheet ? (
          <SheetClose key={item.title + item.href} asChild>
            {Comp}
          </SheetClose>
        ) : (
          Comp
        );
      })}
    </>
  );
}
