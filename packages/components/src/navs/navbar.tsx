import { ModeToggle } from '../theme/theme-toggle';
import { GithubIcon, TwitterIcon, ExternalLinkIcon } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import Anchor from './anchor';
import { SheetLeftbar } from './leftbar';
import { buttonVariants } from '../ui/button';
import { SheetClose } from '../ui/sheet';
import { APP_GITHUB_URL, APP_NAME, PARENT_APP_URL } from '@repo/shared/lib/constants';
import { PropsWithChildren } from 'react';
import { NavbarProps, NavMenuProps } from './types';
import { cn } from '@repo/shared/lib/utils';

export function Navbar(props: PropsWithChildren<NavbarProps>) {
  const { 
    navlinks = [], 
    sheetChildren,
    authChildren, 
    children 
  } = props;

  return (
    <nav className="w-full border-b h-16 sticky top-0 z-50 backdrop-filter backdrop-blur-xl bg-opacity-5">
      <div className="xl:container px-2 sm:px-8 mx-auto h-full flex items-center justify-between md:gap-2">
        <div className="flex items-center gap-5">
          <SheetLeftbar navlinks={navlinks}>{sheetChildren}</SheetLeftbar>
          <div className="flex items-center gap-6">
            <div className="md:flex hidden">
              <Logo />
            </div>
            <div className="md:flex hidden items-center gap-5 text-sm font-medium text-muted-foreground">
              <NavMenu navlinks={navlinks} />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2" suppressHydrationWarning>
            {children}
            <div className="flex ml-2.5 sm:ml-0 items-center">
              <a href={APP_GITHUB_URL} className={buttonVariants({ variant: 'ghost', size: 'icon' })} target="_blank" rel="noopener noreferrer">
                <GithubIcon className="h-[1.1rem] w-[1.1rem]" />
              </a>
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
              { authChildren }
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export function Logo({ className }: { className?: string }) {
  const classes = cn('flex items-center gap-2.5', className);
  return (
    <Link href={PARENT_APP_URL} className={ classes }>
      <Image src={ '/static/brand/ingra-logo-dark.svg' } width={50} height={50} className="h-7 w-auto block" alt={ APP_NAME + ' Logo'} suppressHydrationWarning />
      <h2 className="text-md font-light sr-only">{APP_NAME.toUpperCase()}</h2>
    </Link>
  );
}

export function NavMenu(props: NavMenuProps) {
  const { 
    className,
    navlinks, 
    isSheet = false 
  } = props;
  return (
    <>
      {navlinks.map((item) => {
        const Comp = (
          <Anchor key={item.title + item.href} activeClassName="text-primary font-semibold" absolute className={ cn("flex items-center gap-1", className ) } href={item.href} title={item?.description || ''}>
            {item.title} {item.external && <ExternalLinkIcon className="w-3 h-3 align-super" strokeWidth={3} />}
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
