import { NextRequest, NextResponse } from "next/server";
import { APP_SESSION_COOKIE_NAME } from "../../../lib/constants";
// import { APP_SESSION_COOKIE_NAME } from "@lib/constants";

export async function GET(request: NextRequest) {
  return NextResponse.json(
    {
      "schema_version": "v1",
      "name_for_human": "TODO List (no auth)",
      "name_for_model": "todo",
      "description_for_human": "Manage your TODO list. You can add, remove and view your TODOs.",
      "description_for_model": "Plugin for managing a TODO list, you can add, remove and view your TODOs.",
      "auth": {
        "type": "none"
      },
      "api": {
        "type": "openapi",
        "url": "http://localhost:5003/openapi.yaml"
      },
      "logo_url": "http://localhost:5003/logo.png",
      "contact_email": "legal@example.com",
      "legal_info_url": "http://example.com/legal"
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
