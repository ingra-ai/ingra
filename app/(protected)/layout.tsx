import type { FC } from 'react';
import { getAuthSession } from '@/app/auth/session';
import { APP_AUTH_LOGIN_URL } from '@lib/constants';
import { redirect, RedirectType } from 'next/navigation';
import { PropsWithChildren } from 'react';
import { Navbar } from '@components/navs/Navbar';
import SideNav from '@components/navs/SideNav';


const ProtectedLayout: FC<PropsWithChildren> = async (props) => {
  const { children } = props;
  const authSession = await getAuthSession();

  if ( !authSession ) {
    redirect(APP_AUTH_LOGIN_URL, RedirectType.replace);
  }

  return (
    <div id="protected-layout" className='block min-h-screen pt-16' data-testid="protected-layout">
      <Navbar authSession={ authSession } className='fixed inset-y-0 w-full h-16 z-50' />
      <div className="grid grid-cols-1 lg:grid-cols-12 2xl:grid-cols-10 min-h-[calc(100vh-128px)]">
        <div className="hidden lg:block lg:col-span-2 2xl:col-span-1 pt-4">
          <SideNav className='border-r border-gray-800' />
        </div>
        <main className='px-2 lg:px-3 xl:px-4 2xl:pl-6 mt-4 xl:mt-6 col-span-1 lg:col-span-10 2xl:col-span-9'>
          {children}
        </main>
      </div>
    </div>
  );
};

export default ProtectedLayout;
