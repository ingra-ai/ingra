import { NextRequest, NextResponse } from "next/server";
import { apiAuthTryCatch } from "@app/api/utils/apiAuthTryCatch";
import { Logger } from "@lib/logger";
import { OpenAI, type ClientOptions } from "openai";

/**
 * @ swagger - Disabled for now - but this is working example
 * /api/v1/me/assistants:
 *   get:
 *     summary: Get a streaming response from OpenAI
 *     operationId: getOpenAIStream
 *     description: Fetch a streaming response from OpenAI API based on user input.
 *     responses:
 *       '200':
 *         description: Successfully retrieved streaming response
 *         content:
 *           text/event-stream:
 *             schema:
 *               type: string
 *               example: |
 *                 data: Your streaming response here
 *       '400':
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *     tags:
 *       - OpenAI Integration
 */
export async function GET(req: NextRequest) {
  return await apiAuthTryCatch<any>(async (authSession) => {
    Logger.withTag('me-assistants').withTag(`user:${ authSession.user.id }`).info('Called assistants');

    const ENV_OPENAI_API = authSession.user.envVars.find((envVar) => envVar.key === "OPENAI_API_KEY"),
      ENV_OPENAI_API_KEY = ENV_OPENAI_API?.value;

    if (!ENV_OPENAI_API_KEY) {
      throw new Error("OpenAI API Key is not set in the environment variables. Please set it in your profile settings.");
    }

    const clientOptions: ClientOptions = {
      apiKey: ENV_OPENAI_API_KEY,
    };

    const openai = new OpenAI(clientOptions);

    const completions = await openai.chat.completions.create(
      {
        model: "gpt-4o",
        messages: [{ role: "user", content: "Tell me a story." }],
        stream: true,
      },
      { stream: true }
    );

    const stream = completions.toReadableStream();

    return new NextResponse(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  });
}
