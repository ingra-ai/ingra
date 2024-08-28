import { NextRequest, NextResponse } from "next/server";
import { apiAuthTryCatch } from "@repo/shared/utils/apiAuthTryCatch";
import { Logger } from "@repo/shared/lib/logger";
import { generateUserVars } from "@repo/shared/utils/vm/generateUserVars";
import { generateCodeDefaultTemplate } from "@repo/shared/utils/vm/functions/generateCodeDefaultTemplate";
import { mixpanel } from "@repo/shared/lib/analytics";
import { getAnalyticsObject } from "@repo/shared/lib/utils/getAnalyticsObject";

/**
 * @swagger
 * /api/v1/me/curateFunctions/getCodeTemplate:
 *   get:
 *     summary: Getting the code template for current user. It will show what are the available user vars, environment vars, and VM globals in the comment that are ready to be utilized when generating code.
 *     operationId: getCodeTemplate
 *     responses:
 *       '200':
 *         description: Successfully retrieved the function
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiSuccess'
 *       '400':
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       '404':
 *         description: Function not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *     tags:
 *       - Built-ins Internal
 */
export async function GET(req: NextRequest) {
  return await apiAuthTryCatch<any>(async (authSession) => {
    /**
     * Populate skeleton function record with user and environment variables as code template.
     */
    const optionalEnvVars = authSession.user.envVars.map((envVar) => ({
        id: envVar.id,
        ownerUserId: envVar.ownerUserId,
        key: envVar.key,
        value: envVar.value,
      })),
      userVarsRecord = generateUserVars(authSession),
      allUserAndEnvKeys = Object.keys(userVarsRecord).concat(
        optionalEnvVars.map((envVar) => envVar.key),
      ),
      codeTemplate = generateCodeDefaultTemplate(allUserAndEnvKeys);

    /**
     * Analytics & Logging
     */
    mixpanel.track("Function Executed", {
      distinct_id: authSession.user.id,
      type: "built-ins",
      ...getAnalyticsObject(req),
      operationId: "getCodeTemplate",
    });

    Logger.withTag("api|builtins")
      .withTag("operation|curateFunctions-getCodeTemplate")
      .withTag(`user|${authSession.user.id}`)
      .info("Retrieved code template for the user.");

    return NextResponse.json(
      {
        status: "success",
        message:
          'Successfully retrieved the code template ready to be curated for a function suits your need. You can utilize "environmentVariables" endpoint in case you need more customization.',
        data: codeTemplate,
      },
      {
        status: 200,
      },
    );
  });
}
