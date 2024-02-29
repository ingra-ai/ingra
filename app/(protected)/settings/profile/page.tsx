import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { getAuthSession } from '@app/auth/session';
import { UserProfileForm } from '../UserProfileForm';
import { redirect, RedirectType } from "next/navigation";
import { APP_AUTH_LOGIN_URL } from "@lib/constants";

const secondaryNavigation = [
  { name: 'Account', href: '#', current: true },
  { name: 'Notifications', href: '#', current: false },
  { name: 'Billing', href: '#', current: false },
  { name: 'Teams', href: '#', current: false },
  { name: 'Integrations', href: '#', current: false },
]

/**
 * Profile Page
 * @see https://tailwindui.com/components/application-ui/forms/form-layouts
 */
export default async function Page() {
  const authSession = await getAuthSession();

  if (!authSession || authSession.expiresAt < new Date()) {
    redirect(APP_AUTH_LOGIN_URL, RedirectType.replace);
  }

  return (
    <div className="xl:pl-52 2xl:pl-72">
      <h1 className="sr-only">Account Settings</h1>

      <header className="border-b border-white/5">
        {/* Secondary navigation */}
        <nav className="flex overflow-x-auto py-4">
          <ul
            role="list"
            className="flex min-w-full flex-none gap-x-6 px-4 text-sm font-semibold leading-6 text-gray-400 sm:px-6 lg:px-8"
          >
            {secondaryNavigation.map((item) => (
              <li key={item.name}>
                <a href={item.href} className={item.current ? 'text-indigo-400' : ''}>
                  {item.name}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      {/* Settings forms */}
      <div className="divide-y divide-white/5">
        <div className="grid max-w-7xl grid-cols-1 gap-x-8 gap-y-10 px-4 py-16 sm:px-6 md:grid-cols-3 lg:px-8">
          <div>
            <h2 className="text-base font-semibold leading-7 text-white">Personal Information</h2>
            <p className="mt-1 text-sm leading-6 text-gray-400">
              Use a permanent address where you can receive mail.
            </p>
          </div>
          <UserProfileForm authSession={authSession} />
        </div>

        <div className="grid max-w-7xl grid-cols-1 gap-x-8 gap-y-10 px-4 py-16 sm:px-6 md:grid-cols-3 lg:px-8">
          <div>
            <h2 className="text-base font-semibold leading-7 text-white">Log out other sessions</h2>
            <p className="mt-1 text-sm leading-6 text-gray-400">
              Please enter your password to confirm you would like to log out of your other sessions across all of
              your devices.
            </p>
          </div>

          <div className="md:col-span-2">
            <div className="mt-8 flex">
              <button
                type="button"
                className="rounded-md bg-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
              >
                Log out other sessions
              </button>
            </div>
          </div>
        </div>

        <div className="grid max-w-7xl grid-cols-1 gap-x-8 gap-y-10 px-4 py-16 sm:px-6 md:grid-cols-3 lg:px-8">
          <div>
            <h2 className="text-base font-semibold leading-7 text-white">Delete account</h2>
            <p className="mt-1 text-sm leading-6 text-gray-400">
              No longer want to use our service? You can delete your account here. This action is not reversible.
              All information related to this account will be deleted permanently.
            </p>
          </div>

          <div className="flex items-start md:col-span-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger type="button" className="rounded-md bg-gray-500 px-3 py-2 text-sm font-semibold text-white shadow-sm">
                  Yes, delete my account
                </TooltipTrigger>
                <TooltipContent>
                  <p>This is not supported at the moment</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>
    </div>
  )
}