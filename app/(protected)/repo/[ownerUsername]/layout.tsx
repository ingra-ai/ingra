import { Suspense, type ReactNode } from 'react';
import type { Metadata } from 'next'
import { APP_DESCRIPTION, APP_NAME } from '@lib/constants';
import { getAuthSession } from '@app/auth/session';
import RepoTopNav from './RepoTopNav';
 
export const metadata: Metadata = {
  title: ['Hubs', APP_NAME].join(' | '),
  description: APP_DESCRIPTION,
}

type LayoutProps = {
  mine: ReactNode;
  community: ReactNode;
  params: {
    ownerUsername: string;
  };
  children: ReactNode;
};

async function Layout (props: LayoutProps) {
  const { mine, community, params, children } = props;
  const { ownerUsername } = params;
  const authSession = await getAuthSession();
  const itsMe = authSession?.user?.profile?.userName === ownerUsername;

  return (
    <div className="relative h-full w-full p-4" data-testid="repo-layout">
      <RepoTopNav ownerUsername={ownerUsername} />
      <Suspense fallback={<div>Loading...</div>}>
        { 
          itsMe ? mine : community
        }
      </Suspense>
    </div>
  );
}

export default Layout;
