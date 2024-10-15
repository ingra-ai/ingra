import { getAuthSession } from '@repo/shared/data/auth/session';
import { PropsWithChildren } from 'react';

import LayoutWithNav from '@/components/layouts/LayoutWithNav';

import type { FC } from 'react';

const ProtectedLayout: FC<PropsWithChildren> = async (props) => {
  const { children } = props;
  const authSession = await getAuthSession();

  return <LayoutWithNav authSession={authSession || undefined}>{children}</LayoutWithNav>;
};

export default ProtectedLayout;
