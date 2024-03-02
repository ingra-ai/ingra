import { NextRequest, NextResponse } from "next/server";
import { APP_OPENAI_VERIFICATION_TOKEN, APP_SESSION_COOKIE_NAME, APP_SUPPORT_MAILTO, APP_URL } from "../../../lib/constants";
// import { APP_SESSION_COOKIE_NAME } from "@lib/constants";

export async function GET(request: NextRequest) {
  return NextResponse.json(
    {
      "schema_version": "v1",
      "name_for_human": "TODO List (OAuth)",
      "name_for_model": "todo_oauth",
      "description_for_human": "Manage your TODO list. You can add, remove and view your TODOs.",
      "description_for_model": "Plugin for managing a TODO list, you can add, remove and view your TODOs.",
      "auth": {
        "type": "oauth",
        "client_url": `${ APP_URL }/oauth`,
        "scope": "",
        "authorization_url": `${ APP_URL }/auth/oauth_exchange`,
        "authorization_content_type": "application/json",
        "verification_tokens": {
          "openai": APP_OPENAI_VERIFICATION_TOKEN
        }
      },
      "api": {
        "type": "openapi",
        "url": `${APP_URL}/openapi.yaml`
      },
      "logo_url": `${APP_URL}/static/brand/bakabit-white-logo-only-png`,
      "contact_email": APP_SUPPORT_MAILTO,
      "legal_info_url": `${APP_URL}/legal`,
    }
    ,
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
