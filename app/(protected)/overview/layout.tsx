import type { FC, ReactNode } from 'react';
import { getAuthSession } from '@/app/auth/session';
import { APP_AUTH_LOGIN_URL } from '@lib/constants';
import { redirect, RedirectType } from 'next/navigation';
import { PropsWithChildren } from 'react';

type OverviewLayoutProps = {
  assistant: ReactNode;
};


const OverviewLayout: FC<PropsWithChildren<OverviewLayoutProps>> = async (props) => {
  const { assistant, children } = props;
  const authSession = await getAuthSession();

  if ( !authSession ) {
    redirect(APP_AUTH_LOGIN_URL, RedirectType.replace);
  }

  return (
    <div id="overview-layout" className='block' data-testid="overview-layout">
      <div className="flex flex-col xl:flex-row-reverse space-y-8 xl:space-y-0">
        <div className="xl:flex-1">
          { children }
        </div>
        <div className="xl:flex-0">
          { assistant }
        </div>
      </div>
    </div>
  );
};

export default OverviewLayout;
