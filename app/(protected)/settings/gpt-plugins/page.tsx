import { getAuthSession } from "@app/auth/session";
import { PhraseCodeForm } from "@protected/settings/forms/PhraseCodeForm";

/**
 * Profile Page
 * @see https://tailwindui.com/components/application-ui/forms/form-layouts
 */
export default async function Page() {
  const authSession = await getAuthSession();

  return (
    <div className="mt-10 sm:px-2 lg:px-4 xl:px-8">
      <h2 className="text-base font-semibold leading-7 text-white">Generate Your Authentication Phrase Code</h2>
      <p className="mt-1 text-sm leading-5 text-gray-400">
        Create a unique phrase code for secure authentication. Each generated code is valid for one minute after creation, ensuring enhanced security for your session.
      </p>
      <p className="mt-2 font-semibold text-xs leading-5 text-gray-500">
        Note: Within your active session, the phrase code can be reused for continuous access.
      </p>
      {
        authSession && (
          <div className="mt-5">
            <PhraseCodeForm authSession={authSession} />
          </div>
        )
      }
    </div>
  )
}