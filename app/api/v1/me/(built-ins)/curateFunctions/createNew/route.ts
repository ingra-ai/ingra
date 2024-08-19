import { NextRequest, NextResponse } from "next/server";
import { apiAuthTryCatch } from "@app/api/utils/apiAuthTryCatch";
import { Logger } from "@lib/logger";
import { validateAction } from "@lib/action-helpers";
import { FunctionArgumentSchema, FunctionSchema, FunctionTagsSchema } from "@/schemas/function";
import {
  upsertFunction as dataUpsertFunctions
} from '@data/functions';
import { generateUserVars } from "@app/api/utils/vm/generateUserVars";
import { generateCodeDefaultTemplate } from "@app/api/utils/vm/functions/generateCodeDefaultTemplate";
import isNil from 'lodash/isNil';
import isBoolean from 'lodash/isBoolean';
import { z } from "zod";
import { mixpanel } from "@lib/analytics";
import { getAnalyticsObject } from "@lib/utils/getAnalyticsObject";

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
 *                 type: object
 *                 required: [slug, description]
 *                 properties:
 *                   slug:
 *                     type: string
 *                     description: The slug of the function to be edited
 *                   code:
 *                     type: string
 *                     description: The code of the function
 *                   description:
 *                     type: string
 *                     description: The description of the function
 *                   httpVerb:
 *                     type: string
 *                     description: The HTTP verb of the function
 *                   isPrivate:
 *                     type: boolean
 *                     description: If the function is private
 *                   isPublished:
 *                     type: boolean
 *                     description: If the function is published
 *                   arguments:
 *                     type: array
 *                     items:
 *                       $ref: '#/components/schemas/FunctionArgument'
 *                   tags:
 *                     type: array
 *                     items:
 *                       $ref: '#/components/schemas/FunctionTag'
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
 *       - Curate Functions
 */
export async function POST(req: NextRequest) {
  const requestArgs = await req.json();
  const functionPayload = requestArgs?.function as z.infer<typeof FunctionSchema>;
    
  if ( !functionPayload || typeof functionPayload !== 'object' || Object.keys(functionPayload).length === 0 ) {
    throw new Error('Function payload is empty or invalid. Are you passing the patch data as "{ function: { ... } }"?');
  }

  if ( functionPayload.id ) {
    throw new Error('Creating new function doesn\'t require an ID. Please remove the ID from the function schema.');
  }

  if ( isNil( functionPayload.slug.trim() ) ) {
    throw new Error('Function slug is required to create a new function.');
  }

  if ( isNil( functionPayload.description.trim() ) ) {
    throw new Error('Function description is required to create a new function.');
  }

  return await apiAuthTryCatch<any>(async (authSession) => {
    const providedFields: ( keyof z.infer<typeof FunctionSchema> )[] = ['slug', 'description']

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
      allUserAndEnvKeys = Object.keys(userVarsRecord).concat(optionalEnvVars.map(envVar => envVar.key));

    const safeFunctionRecord = {
      slug: functionPayload.slug.trim(),
      code: generateCodeDefaultTemplate(allUserAndEnvKeys),
      isPrivate: true,
      isPublished: true,
      httpVerb: 'GET',
      description: functionPayload.description.trim(),
      arguments: [] as z.infer<typeof FunctionArgumentSchema>[],
      tags: [] as z.infer<typeof FunctionTagsSchema>[],
    } as z.infer<typeof FunctionSchema>;

    /**
     * Populate all the provided fields from the payload. If the field is not provided, it will be populated with the default value.
     */
    const acceptableFieldNames: ( keyof z.infer<typeof FunctionSchema> )[] = ['code', 'httpVerb', 'isPrivate', 'isPublished', 'arguments', 'tags'];
    acceptableFieldNames.forEach(( acceptableFieldName ) => {

      // Check if the field is provided in the payload
      if ( Object.prototype.hasOwnProperty.call( functionPayload, acceptableFieldName ) ) {
        // Add the field to the provided fields list
        providedFields.push(acceptableFieldName);

        // Populate all the fields that are provided
        switch ( acceptableFieldName ) {
          case 'code':
            safeFunctionRecord[acceptableFieldName] = functionPayload[acceptableFieldName];
            break;
          case 'httpVerb':
            safeFunctionRecord[acceptableFieldName] = functionPayload[acceptableFieldName];
            break;
          case 'isPrivate':
          case 'isPublished':
            safeFunctionRecord[acceptableFieldName] = isBoolean(functionPayload[acceptableFieldName]) ? functionPayload[acceptableFieldName] : safeFunctionRecord[acceptableFieldName];
            break;
          case 'arguments':
            safeFunctionRecord.arguments = ( functionPayload.arguments || [] ).filter(( elem ) => elem.name.trim()).map(( elem ) => {
              const newArgument: z.infer<typeof FunctionArgumentSchema> = {
                functionId: '',
                name: elem.name,
                type: elem.type,
                defaultValue: elem.defaultValue,
                description: elem.description,
                isRequired: elem.isRequired,
              };

              return newArgument;
            });
            break;
          case 'tags':
            safeFunctionRecord.tags = ( functionPayload.tags || [] ).filter(( elem ) => elem.name.trim()).map(( elem ) => {
              const newTag: z.infer<typeof FunctionTagsSchema> = {
                functionId: '',
                name: elem.name,
              };

              return newTag;
            });
            break;
          default:
            break;
        }
      }
    });

    const { data } = await validateAction(FunctionSchema, safeFunctionRecord);
    const result = await dataUpsertFunctions(data, authSession.user.id);

    /**
     * Analytics & Logging
     */
    mixpanel.track('Function Executed', {
      distinct_id: authSession.user.id,
      type: 'built-ins',
      ...getAnalyticsObject(req),
      operationId: 'createNewFunction'
    });

    Logger.withTag('api|builtins')
      .withTag('operation|curateFunctions-createNew')
      .withTag(`user|${authSession.user.id}`)
      .withTag(`function|${result.id}`)
      .info(`Created new function ${ result.slug }`);

    // Filter the response to include only the provided fields
    const response: Record<string, any> = {
      id: result.id,
      slug: result.slug,
    };

    // Add the provided fields to the response
    providedFields.forEach((providedField) => {
      if ( Object.prototype.hasOwnProperty.call(result, providedField) ) {
        // @ts-ignore
        response[providedField] = result[providedField];
      }
    });

    return NextResponse.json(
      {
        status: 'success',
        message: `Function "${ result.slug }" with ID of "${ result.id }" has been created.`,
        data: response,
      },
      {
        status: 200,
      }
    );
  });
}

