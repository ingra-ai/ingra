import { openai } from '@ai-sdk/openai';
import { getAuthSession } from "@repo/shared/data/auth/session";
import { deleteChatById, getChatById, saveChat } from "@repo/shared/data/chat";
import { ActionError } from "@repo/shared/types";
import { apiAuthTryCatch } from "@repo/shared/utils/apiAuthTryCatch";
import { convertToCoreMessages, Message, streamText } from "ai";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { customModel } from "@/ai";


type ChatJson = {
  id: string;
  messages: Array<Message>;
}

export async function POST(request: NextRequest) {
  const { id, messages }: ChatJson = await request.json();
  const authSession = await getAuthSession();

  if ( !authSession ) {
    return NextResponse.json({
      status: 'error',
      message: "Unauthorized",
      data: null,
    }, { status: 401 });
  }

  // let result: Awaited<ReturnType<typeof streamText<any>>>;
  const coreMessages = convertToCoreMessages(messages);

  const result = await streamText({
    model: customModel,
    system:
      "you are a friendly assistant! keep your responses concise and helpful.",
    messages: coreMessages,
    maxSteps: 5,
    tools: {
      getWeather: {
        description: "Get the current weather at a location",
        parameters: z.object({
          latitude: z.number(),
          longitude: z.number(),
        }),
        execute: async ({ latitude, longitude }) => {
          const response = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m&hourly=temperature_2m&daily=sunrise,sunset&timezone=auto`,
          );

          const weatherData = await response.json();
          return weatherData;
        },
      },
    },
    onFinish: async ({ responseMessages }) => {
      if (authSession && authSession?.userId) {
        try {
          await saveChat(
            id,
            [...coreMessages, ...responseMessages],
            authSession.userId,
          );
        } catch (error) {
          console.error("Failed to save chat");
        }
      }
    },
    experimental_telemetry: {
      isEnabled: true,
      functionId: "stream-text",
    },
  });

  return result.toDataStreamResponse({});
}

export async function DELETE(request: NextRequest) {
  return await apiAuthTryCatch(async (authSession) => {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
  
    if (!id) {
      throw new ActionError("error", 400, "Chat ID is required");
    }
  
    const chat = await getChatById( id, authSession.userId );

    if ( chat && chat.userId === authSession.userId ) {
      await deleteChatById( id, authSession.userId );

      return NextResponse.json({
        status: 'success',
        message: "Chat deleted",
        data: null,
      });
    }
    else {
      throw new ActionError("error", 401, "Unauthorized");
    }
  });
}