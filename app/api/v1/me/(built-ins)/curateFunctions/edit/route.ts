import { NextRequest, NextResponse } from "next/server";
import { apiAuthTryCatch } from "@app/api/utils/apiAuthTryCatch";
import { Logger } from "@lib/logger";
import db from "@lib/db";
import { validateAction } from "@lib/action-helpers";
import { FunctionArgumentSchema, FunctionSchema, FunctionTagsSchema } from "@/schemas/function";
import cloneDeep from 'lodash/cloneDeep';
import { upsertFunction as dataUpsertFunctions, getFunctionAccessibleByUser } from '@data/functions';
import isEmpty from 'lodash/isEmpty';
import isNil from 'lodash/isNil';
import { z } from "zod";
import { mixpanel } from "@lib/analytics";
import { getAnalyticsObject } from "@lib/utils/getAnalyticsObject";

/**
 * @swagger
 * /api/v1/me/curateFunctions/edit:
 *   patch:
 *     summary: Edits or updates one or more fields on an existing function after knowing the function ID.
 *     operationId: editFunction
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Any of the function fields that can be edited, including arguments and tags. ID is required.
 *             properties:
 *               function:
 *                 type: object
 *                 required: [id]
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: The ID of the function to be edited
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
 *         description: Successfully edited existing function
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
export async function PATCH(req: NextRequest) {
  const requestArgs = await req.json();
  const functionPayload = requestArgs?.function as z.infer<typeof FunctionSchema>;

  return await apiAuthTryCatch<any>(async (authSession) => {
    if ( !functionPayload || typeof functionPayload !== 'object' || Object.keys(functionPayload).length === 0 ) {
      throw new Error('Function payload is empty or invalid. Are you passing the patch data as "{ function: { ... } }"?');
    }
  
    if ( !functionPayload.id ) {
      throw new Error('Function ID is required to edit the function. Consider searching some functions first for your references.');
    }

    const existingFunction = await getFunctionAccessibleByUser(authSession.user.id, functionPayload.id, {
      accessTypes: ['owner'],
    });

    if (!existingFunction) {
      throw new Error('Function not found or you do not have permission to edit the function.');
    }

    // Create a safe function record to be edited
    const safeFunctionRecord = cloneDeep(existingFunction as z.infer<typeof FunctionSchema>);

    // Fill only the provided Function values to the safe function record
    const fieldsToUpdate: Partial<typeof safeFunctionRecord> = {};
    if ( !isNil( functionPayload.slug ) && functionPayload.slug !== safeFunctionRecord.slug ) {
      fieldsToUpdate.slug = functionPayload.slug;
    }

    if ( !isNil( functionPayload.code ) && functionPayload.code !== safeFunctionRecord.code ) {
      fieldsToUpdate.code = functionPayload.code;
    }

    if ( !isNil( functionPayload.isPrivate ) && functionPayload.isPrivate !== safeFunctionRecord.isPrivate ) {
      fieldsToUpdate.isPrivate = functionPayload.isPrivate;
    }

    if ( !isNil( functionPayload.isPublished ) && functionPayload.isPublished !== safeFunctionRecord.isPublished ) {
      fieldsToUpdate.isPublished = functionPayload.isPublished;
    }

    if ( !isNil( functionPayload.httpVerb ) && functionPayload.httpVerb !== safeFunctionRecord.httpVerb ) {
      fieldsToUpdate.httpVerb = functionPayload.httpVerb;
    }

    if ( !isNil( functionPayload.description ) && functionPayload.description !== safeFunctionRecord.description ) {
      fieldsToUpdate.description = functionPayload.description;
    }

    // Fill any provided Arguments values to the safe function record
    const argumentsPayload = ( functionPayload.arguments || [] ).filter(( elem ) => elem.name.trim());
    if ( !isEmpty( argumentsPayload ) ) {
      safeFunctionRecord.arguments = argumentsPayload.map((elem) => {
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
    }

    // Fill any provided Tags values to the safe function record
    const tagsPayload = ( functionPayload.tags || [] ).filter(( elem ) => elem.name.trim());
    if ( !isEmpty( tagsPayload ) ) {
      safeFunctionRecord.tags = tagsPayload.map((elem: any) => {
        const newTag: z.infer<typeof FunctionTagsSchema> = {
          functionId: '',
          name: elem.name,
        };
        return newTag;
      });
    }

    Object.assign(safeFunctionRecord, fieldsToUpdate);

    const { data } = await validateAction(FunctionSchema, safeFunctionRecord);
    
    const result = await dataUpsertFunctions(data, authSession.user.id);

    const allUpdatedFields = Object.keys(fieldsToUpdate);

    /**
     * Analytics & Logging
     */
    mixpanel.track('Function Executed', {
      distinct_id: authSession.user.id,
      type: 'built-ins',
      ...getAnalyticsObject(req),
      operationId: 'editFunction'
    });

    Logger.withTag('api|builtins')
      .withTag('operation|curateFunctions-edit')
      .withTag(`user|${authSession.user.id}`)
      .withTag(`function|${result.id}`)
      .info(`Editing function ${result.slug}`);

    return NextResponse.json(
      {
        status: 'success',
        message: `Successfully updated ${ allUpdatedFields.join(', ') } fields on "${result.slug}" function.`,
        data: {
          id: result.id,
          slug: result.slug,
          ...fieldsToUpdate
        },
      },
      {
        status: 200,
      }
    );
  });
}
