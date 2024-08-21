import { RedirectType, redirect } from 'next/navigation';
import { UserCircleIcon, LinkIcon } from '@heroicons/react/20/solid'
import Link from 'next/link';
import { APP_SETTINGS_PROFILE_URI } from '@lib/constants';

export default async function Page(
  { searchParams, params }: {
    searchParams: Record<string, string | string[] | undefined>;
    params: { ownerUsername: string };
  }
) {
  const { ownerUsername } = params;

  if ( ownerUsername ) {
    return redirect(`/repo/${ ownerUsername }/collections`, RedirectType.replace);
  }

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
