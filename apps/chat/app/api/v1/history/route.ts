import { getChatsByUserId } from "@repo/shared/data/chat";
import { apiAuthTryCatch } from "@repo/shared/utils/apiAuthTryCatch";
import { NextResponse } from "next/server";

export async function GET() {
  return await apiAuthTryCatch(async (authSession) => {
    const chats = await getChatsByUserId(authSession.userId);
    return NextResponse.json({
      status: "success",
      message: "Chats retrieved",
      data: chats,
    });
  });

}