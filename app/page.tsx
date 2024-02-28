import { APP_AUTH_LOGIN_URL, APP_LANDING_PAGE_URL } from "@lib/constants";
import { RedirectType, redirect } from "next/navigation";
import { getAuthSession } from "@/app/auth/session";

export default async function Home() {
  const authSession = await getAuthSession();

  if ( !authSession || authSession.expiresAt < new Date() ) {
    redirect(APP_AUTH_LOGIN_URL, RedirectType.replace);
  }
  else {
    redirect(APP_LANDING_PAGE_URL, RedirectType.replace);
  }
}
