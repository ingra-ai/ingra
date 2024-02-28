import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@app/auth/session";

export async function GET(request: NextRequest) {
  const authSession = getAuthSession();

  return NextResponse.json(
    { authSession },
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
