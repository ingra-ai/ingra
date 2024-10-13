import { ActionError } from "@repo/shared/types";
import { apiAuthTryCatch } from "@repo/shared/utils/apiAuthTryCatch";
import { put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const FileSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.size <= 5 * 1024 * 1024, {
      message: "File size should be less than 5MB",
    })
    .refine(
      (file) =>
        ["image/jpeg", "image/png", "application/pdf"].includes(file.type),
      {
        message: "File type should be JPEG, PNG, or PDF",
      },
    ),
});

export async function POST(request: NextRequest) {
  return await apiAuthTryCatch(async (authSession) => {
    if (request.body === null) {
      throw new ActionError("error", 400, "Request body is empty");
    }

    if ( !authSession.userId ) {
      throw new ActionError("error", 401, "Unauthorized");
    }
  
    try {
      const formData = await request.formData();
      const file = formData.get("file") as File;
  
      if (!file) {
        throw new ActionError("error", 400, "No file uploaded");
      }
  
      const validatedFile = FileSchema.safeParse({ file });
  
      if (!validatedFile.success) {
        const errorMessage = validatedFile.error.errors
          .map((error) => error.message)
          .join(", ");

        throw new ActionError("error", 400, errorMessage);
      }
  
      const filename = [authSession.userId, 'chat', file.name].join("/");
      const fileBuffer = await file.arrayBuffer();
  
      const data = await put(`${filename}`, fileBuffer, {
        access: "public",
      });
      return NextResponse.json(data);
    } catch (error: any) {
      return NextResponse.json(
        { error: error?.message || "Failed to process request" },
        { status: 500 },
      );
    }
  });
}