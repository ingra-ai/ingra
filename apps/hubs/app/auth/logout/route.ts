"use server";
import { APP_SESSION_COOKIE_NAME } from "@repo/shared/lib/constants";
import { cookies } from "next/headers";
import { APP_AUTH_LOGIN_URL } from "@repo/shared/lib/constants";
import { RedirectType, redirect } from "next/navigation";
import db from "@repo/db/client";
import { Logger } from "@repo/shared/lib/logger";

export async function GET() {
  const cookieStore = cookies();
  const jwtCookie = cookieStore.get(APP_SESSION_COOKIE_NAME);

  if (jwtCookie?.value) {
    try {
      // Update db to remove active session
      await db.activeSession.update({
        where: {
          jwt: jwtCookie.value,
        },
        data: {
          expiresAt: new Date(0),
        },
      });
    } catch (error: any) {
      Logger.withTag("action|logout").error(
        "Error removing session due to logout",
        { jwt: jwtCookie.value, error },
      );
    }

    // Remove from redis
    Logger.withTag("action|logout").log("Session removed due to logout", {
      jwt: jwtCookie.value,
    });

    // Remove session cookies
    cookieStore.delete(APP_SESSION_COOKIE_NAME);
  }

  redirect(APP_AUTH_LOGIN_URL, RedirectType.replace);
}
