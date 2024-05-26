import { NextRequest, NextResponse } from "next/server";
import { apiAuthTryCatch } from "@app/api/utils/apiAuthTryCatch";
import { Logger } from "@lib/logger";
import { validateAction } from "@lib/action-helpers";
import { FunctionSchema } from "@/schemas/function";
import {
  upsertFunction as dataUpsertFunctions
} from '@/data/functions';
import { generateUserVars } from "@app/api/utils/vm/generateUserVars";
import { generateCodeDefaultTemplate } from "@app/api/utils/functions/generateCodeDefaultTemplate";
import { z } from "zod";

/**
 * @swagger
 * /api/v1/me/curateFunctions/createNew:
 *   post:
 *     summary: Create a new function for the current user by providing a function schema.
 *     operationId: createNewFunction
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               function:
 *                 allOf:
 *                   - $ref: '#/components/schemas/Function'
 *                   - type: object
 *                     required: [slug, code, httpVerb, description]
 *                     properties: {}
 *               confirm:
 *                 type: boolean
 *                 default: false
 *                 description: Confirms creation of the function if the schema is valid.
 *     responses:
 *       '200':
 *         description: Successfully created new function
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
 *     tags:
 *       - Built-ins Internal
 */
export async function POST(req: NextRequest) {
  const requestArgs = await req.json();
  const { function: functionRecord = {}, confirm = false } = requestArgs;

  return await apiAuthTryCatch<any>(async (authSession) => {
    if ( !functionRecord || typeof functionRecord !== 'object' || Object.keys(functionRecord).length === 0  ) {
      const optionalEnvVars = authSession.user.envVars.map((envVar) => ({
          id: envVar.id,
          ownerUserId: envVar.ownerUserId,
          key: envVar.key,
          value: envVar.value,
        })),
        userVarsRecord = generateUserVars(authSession),
        allUserAndEnvKeys = Object.keys(userVarsRecord).concat(optionalEnvVars.map(envVar => envVar.key));

      const exampleFunction: Partial<z.infer<typeof FunctionSchema>> = {
        slug: 'exampleFunction',
        code: generateCodeDefaultTemplate(allUserAndEnvKeys),
        isPrivate: true,
        isPublished: true,
        httpVerb: 'GET',
        description: 'A brief description of what the function does',
        arguments: [],
        tags: [],
      };

      return NextResponse.json(
        {
          status: 'error',
          message: 'Function schema is empty or invalid. Consider searching some functions first for your reference. Or use this as a reference to create a new function.',
          data: exampleFunction,
        },
        {
          status: 400,
        }
      );
    }

    if ( functionRecord.id ) {
      throw new Error('Creating new function doesn\'t require an ID. Please remove the ID from the function schema.');
    }

    const { data } = await validateAction(FunctionSchema, functionRecord);

    if (!confirm) {
      return NextResponse.json(
        {
          status: 'info',
          message: 'Function schema is valid. Please review and confirm to create the function.',
          data: {
            slug: data.slug,
            code: data.code,
            httpVerb: data.httpVerb,
            description: data.description,
            isPrivate: data.isPrivate,
            isPublished: data.isPublished,
            arguments: ( data.arguments || [] ).map( elem => ({
              name: elem.name,
              type: elem.type,
              defaultValue: elem.defaultValue,
              description: elem.description,
              isRequired: elem.isRequired,
            }) ),
            tags: ( data.tags || [] ).map( elem => ({
              name: elem.name,
            }) ),
          },
        },
        {
          status: 200,
        }
      );
    }

    const result = await dataUpsertFunctions(data, authSession.user.id);
    
    Logger.withTag('me-builtins').withTag('curateFunctions-createNew').withTag(`user:${ authSession.user.id }`).info(`Created new function ${ result.slug }`);

    return NextResponse.json(
      {
        status: 'success',
        message: `New function has been created with the slug ${ result.slug } and ID of ${ result.id }.`,
        data: result,
      },
      {
        status: 200,
      }
    );
  });
}

