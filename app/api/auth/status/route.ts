import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@app/auth/session";
import { APP_SESSION_COOKIE_NAME } from "@lib/constants";
import { decodeToken } from "@lib/tokens";

export async function GET(request: NextRequest) {
  const jwtCookie = request.cookies.get(APP_SESSION_COOKIE_NAME);

  if ( !jwtCookie || !jwtCookie?.value ) {
    return NextResponse.json(
      { error: "Session not found" },
      {
        status: 404
      }
    );
  }

  const authSession = await getAuthSession();
  const decodedCookie: any = decodeToken(jwtCookie.value);

  delete decodedCookie.iat;
  delete decodedCookie.exp;
  delete decodedCookie.id;

  return NextResponse.json(
    { 
      authSession,
      decoded: decodedCookie
    },
    {
      status: 200
    }
  );
}

// Notice the funciton definiton:
export async function POST(request: NextRequest) {
  return NextResponse.json(
    { error: "Method not allowed" },
    {
      status: 405
    }
  );
}
