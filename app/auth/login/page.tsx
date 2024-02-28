import { APP_LANDING_PAGE_URL, APP_NAME } from "@lib/constants";
import Image from "next/image";
import { MagicLoginForm } from "./MagicLoginForm";
import { getAuthSession } from "@/app/auth/session";
import { redirect, RedirectType } from "next/navigation";

export default async function AuthLogin() {
  const authSession = await getAuthSession();

  if ( authSession && authSession.expiresAt > new Date() ) {
    redirect(APP_LANDING_PAGE_URL, RedirectType.replace);
  }

  return (
    <div className="h-screen flex flex-1 flex-col justify-center items-center p-6">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <Image
          className="mx-auto h-auto w-auto"
          src="/static/brand/bakabit-white-logo-only.svg"
          alt={ APP_NAME }
          width={96}
          height={96}
        />
      </div>
      <MagicLoginForm />
    </div>
  );
};
