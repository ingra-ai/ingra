import { getAuthSession } from "@/app/auth/session";
import { APP_AUTH_LOGIN_URL } from "@lib/constants";
import { cn } from "@lib/utils";
import { redirect, RedirectType } from "next/navigation";
import styles from './layout.module.scss';
import { PropsWithChildren } from "react";
import SideNav from "@components/navs/SideNav";

const ProtectedLayout: React.FC<PropsWithChildren> = async ( props ) => {
  const authSession = await getAuthSession();

  if ( !authSession || authSession.expiresAt < new Date() ) {
    redirect(APP_AUTH_LOGIN_URL, RedirectType.replace);
  }
  
  const layoutClasses = cn( styles['layout-body'] );
  
  return (
    <div className={ layoutClasses }>
      <div className={ cn(styles['main-wrapper']) } data-testid="protected-layout">
        <div className={ cn('bg-secondary', styles['sidenav-container']) }>
          <SideNav authSession={ authSession } />
        </div>
        <main className={ cn('p-5', styles['main-container']) }>
          {props.children}
        </main>
      </div>
    </div>
  );
};

export default ProtectedLayout;