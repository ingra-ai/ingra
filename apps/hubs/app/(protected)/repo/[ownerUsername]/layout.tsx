import { UserCircleIcon, LinkIcon } from '@heroicons/react/20/solid';
import { LoaderV1 } from '@repo/components/loaders/loader-v1';
import { getAuthSession } from '@repo/shared/data/auth/session';
import { getUserProfileByUsername } from '@repo/shared/data/profile';
import { APP_DESCRIPTION, APP_NAME , HUBS_SETTINGS_PROFILE_URI } from '@repo/shared/lib/constants';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense, type ReactNode } from 'react';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: ['Hubs', APP_NAME].join(' | '),
  description: APP_DESCRIPTION,
};

type LayoutProps = {
  mine: ReactNode;
  community: ReactNode;
  params: Promise<{
    ownerUsername: string;
  }>;
  children: ReactNode;
};

async function Layout(props: LayoutProps) {
  const { mine, community, params, children } = props;
  const { ownerUsername } = await params;

  const [authSession, ownerProfile] = await Promise.all([getAuthSession(), getUserProfileByUsername(ownerUsername)]);

  const itsMe = Boolean(authSession?.user.id && authSession.user.id === ownerProfile?.userId);

  // If owner user profile doesn't exist, OR current user profile username is not set, promote user to set profile username
  if ( itsMe && !authSession?.user?.profile?.userName ) {
    return (
      <div className="flex flex-col w-full h-full justify-center items-center">
        <UserCircleIcon aria-hidden="true" className="h-24 w-24" />
        <h3 className="mt-2 text-sm font-semibold text-gray-900">No projects</h3>
        <p className="mt-1 text-sm text-gray-500">Get started by setting up your profile.</p>
        <div className="mt-6">
          <Link
            href={HUBS_SETTINGS_PROFILE_URI}
            className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            <LinkIcon aria-hidden="true" className="mr-2 h-5 w-5" />
            Set up your username
          </Link>
        </div>
      </div>
    );
  }
  else if ( !ownerProfile ) {
    return notFound();
  }

  return (
    <div className="relative xl:container px-2 sm:px-8" data-testid="repo-layout">
      <Suspense 
        fallback={<LoaderV1 message="Loading..." cloudSize={24} duration={1.5} delay={0.2} fallbackUrl="/" />}
      >
          {itsMe ? mine : community}
      </Suspense>
    </div>
  );
}

export default Layout;
