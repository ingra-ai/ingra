import { getAuthSession } from '@/app/auth/session';
import { APP_AUTH_LOGIN_URL } from '@lib/constants';
import { cn } from '@lib/utils';
import { redirect, RedirectType } from 'next/navigation';
import { PropsWithChildren } from 'react';
import { ResponsiveNav } from '@components/navs/ResponsiveNav';

const ProtectedLayout: React.FC<PropsWithChildren> = async (props) => {
  const { children } = props;
  const authSession = await getAuthSession();

  if ( !authSession ) {
    redirect(APP_AUTH_LOGIN_URL, RedirectType.replace);
  }

  return (
    <div id="protected-layout" className={cn()} data-testid="protected-layout">
      <ResponsiveNav authSession={authSession}>
        <main className={cn('px-2 lg:px-3 xl:px-4 2xl:pl-6 mt-4 xl:mt-6')}>
          {children}
        </main>
      </ResponsiveNav>
    </div>
  );
};

export default ProtectedLayout;
