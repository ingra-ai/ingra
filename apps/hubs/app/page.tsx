import {
  APP_AUTH_LOGIN_URL,
  APP_LANDING_PAGE_URL,
} from "@repo/shared/lib/constants";
import { RedirectType, redirect } from "next/navigation";
import { getAuthSession } from "@repo/shared/data/auth/session";

export default async function Home() {
  const authSession = await getAuthSession();

  if (!authSession) {
    redirect(APP_AUTH_LOGIN_URL, RedirectType.replace);
  } else {
    redirect(APP_LANDING_PAGE_URL, RedirectType.replace);
  }
}
