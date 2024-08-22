import { Suspense, type ReactNode } from 'react';
import type { Metadata } from 'next'
import { APP_DESCRIPTION, APP_NAME } from '@lib/constants';
import { getAuthSession } from '@app/auth/session';
import { UserCircleIcon, LinkIcon } from '@heroicons/react/20/solid';
import { APP_SETTINGS_PROFILE_URI } from '@lib/constants';
import Link from 'next/link';
import RepoTopNav from './RepoTopNav';
import { getUserProfileByUsername } from '@data/profile';
 
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

  const [authSession, ownerProfile] = await Promise.all([
    getAuthSession(),
    getUserProfileByUsername(ownerUsername)
  ]);

  // If owner user profile doesn't exist, OR current user profile username is not set, promote user to set profile username
  if ( ( !ownerProfile?.userId || !ownerUsername ) || !authSession?.user?.profile?.userName ) {
    return (
      <div className="flex flex-col w-full h-full justify-center items-center">
        <UserCircleIcon aria-hidden="true" className="h-24 w-24" />
        <h3 className="mt-2 text-sm font-semibold text-gray-900">No projects</h3>
        <p className="mt-1 text-sm text-gray-500">Get started by setting up your profile.</p>
        <div className="mt-6">
          <Link
            href={ APP_SETTINGS_PROFILE_URI }
            className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            <LinkIcon aria-hidden="true" className="mr-2 h-5 w-5" />
            Set up your username
          </Link>
        </div>
      </div>
    );
  }

  const itsMe = authSession.user.profile.userName === ownerUsername;

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
