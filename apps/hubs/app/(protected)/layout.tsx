import type { FC } from 'react';
import { getAuthSession } from '@repo/shared/data/auth/session';
import { APP_AUTH_LOGIN_URL } from '@repo/shared/lib/constants';
import { redirect, RedirectType } from 'next/navigation';
import { PropsWithChildren } from 'react';
import LayoutWithNav from '@/components/layouts/LayoutWithNav';

const ProtectedLayout: FC<PropsWithChildren> = async (props) => {
  const { children } = props;
  const authSession = await getAuthSession();

  if (!authSession) {
    redirect(APP_AUTH_LOGIN_URL, RedirectType.replace);
  }

  return <LayoutWithNav authSession={authSession}>{children}</LayoutWithNav>;
};

export default ProtectedLayout;
