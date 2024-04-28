import { NextRequest, NextResponse } from "next/server";
import { apiUserTryCatch } from "@app/api/utils/apiUserTryCatch";
import { ActionError } from "@lib/api-response";
import { executeCodeSandbox } from "@app/api/v1/u/actions/executeCodeSandbox";

export async function GET(req: NextRequest, { params }: { params: { username: string; paths: string[] } }) {
  const { username, paths } = params;

  return await apiUserTryCatch<any>(username, '', async (context) => {
    if ( !Array.isArray(paths) || !paths.length ) {
      throw new ActionError('error', 400, `Invalid paths.`);
    }

    const uri = '/' + paths.join('/');
  
    switch (uri) {
      case '/test':
        const result = await executeCodeSandbox(
          '\nasync function handler(ctx) {\n  const { envVars, ...args } = ctx;\n  console.log({ envVars, args });\n\n  // Add your code here\n return JSON.stringify(envVars)}\n', 
          context
        );

        return NextResponse.json(
          {
            status: 'success',
            message: 'Code executed successfully',
            data: result || null,
          },
          {
            status: 200,
          }
        );
      default:
        return NextResponse.json(
          {
            status: 'error',
            message: `Paths not supported for "${uri}"`,
            data: null,
          },
          {
            status: 404,
          }
        );
    }
  });
};
