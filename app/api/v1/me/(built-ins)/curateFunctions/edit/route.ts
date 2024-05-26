import { NextRequest, NextResponse } from "next/server";
import { apiAuthTryCatch } from "@app/api/utils/apiAuthTryCatch";
import { Logger } from "@lib/logger";
import db from "@lib/db";
import { validateAction } from "@lib/action-helpers";
import { FunctionArgumentSchema, FunctionSchema, FunctionTagsSchema } from "@/schemas/function";
import cloneDeep from 'lodash/cloneDeep';
import {
  upsertFunction as dataUpsertFunctions
} from '@/data/functions';
import { z } from "zod";

/**
 * @swagger
 * /api/v1/me/curateFunctions/edit:
 *   patch:
 *     summary: Edits or updates an existing function after knowing the function ID.
 *     operationId: editFunction
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: The schema of the function to be edited
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
 *                 description: Confirms edit action of the function if the schema is valid.
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
 */
export async function PATCH(req: NextRequest) {
  const requestArgs = await req.json();
  const { function: functionRecord = {}, confirm = false } = requestArgs;

  return await apiAuthTryCatch<any>(async (authSession) => {
    if ( !functionRecord || typeof functionRecord !== 'object' || Object.keys(functionRecord).length === 0  ) {
      throw new Error('Function schema is empty or invalid. Consider searching some functions first for your references.');
    }

    if ( !functionRecord.id ) {
      throw new Error('Function ID is required to edit the function.');
    }

    const existingFunction = await db.function.findFirst({
      where: {
        id: functionRecord.id,
        ownerUserId: authSession.user.id,
      },
      include: {
        arguments: true,
        tags: true,
      }
    });

    if ( !existingFunction ) {
      throw new Error('Function not found or you do not have permission to edit the function.');
    }

    // Create a safe function record to be edited
    const safeFunctionRecord = cloneDeep(existingFunction as z.infer<typeof FunctionSchema>);

    // 1. Fill any provided Function values to the safe function record
    safeFunctionRecord.slug = functionRecord?.slug || safeFunctionRecord.slug;
    safeFunctionRecord.code = functionRecord?.code || safeFunctionRecord.code;
    safeFunctionRecord.isPrivate = typeof functionRecord?.isPrivate === 'boolean' ? functionRecord.isPrivate : safeFunctionRecord.isPrivate;
    safeFunctionRecord.isPublished = typeof functionRecord?.isPublished === 'boolean' ? functionRecord.isPublished : safeFunctionRecord.isPublished;
    safeFunctionRecord.httpVerb = functionRecord?.httpVerb || safeFunctionRecord.httpVerb;
    safeFunctionRecord.description = functionRecord?.description || safeFunctionRecord.description;

    // 2. Fill any provided Arguments values to the safe function record
    safeFunctionRecord.arguments = ( functionRecord?.arguments || [] ).map( (elem: any) => {
      const newArgument: z.infer<typeof FunctionArgumentSchema> = {
        functionId: '',
        name: elem.name,
        type: elem.type,
        defaultValue: elem.defaultValue,
        description: elem.description,
        isRequired: elem.isRequired,
      };

      return newArgument;
    } ).filter( (elem: any) => elem.name.trim() );

    // 3. Fill any provided Tags values to the safe function record
    safeFunctionRecord.tags = ( functionRecord?.tags || [] ).map( (elem: any) => {
      const newTag: z.infer<typeof FunctionTagsSchema> = {
        functionId: '',
        name: elem.name,
      };

      return newTag;
    } ).filter( (elem: any) => elem.name.trim() );

    const { data } = await validateAction(FunctionSchema, safeFunctionRecord);

    if (!confirm) {
      return NextResponse.json(
        {
          status: 'info',
          message: 'Function schema is valid. Please review and confirm to edit the function.',
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
            }) ).filter( elem => elem.name.trim() ),
            tags: ( data.tags || [] ).map( elem => ({
              name: elem.name,
            }) ).filter( elem => elem.name.trim() ),
          },
        },
        {
          status: 200,
        }
      );
    }

    const result = await dataUpsertFunctions(data, authSession.user.id);
    
    Logger.withTag('me-builtins').withTag('curateFunctions-edit').withTag(`user:${ authSession.user.id }`).info(`Editing function ${ result.slug }`);

    return NextResponse.json(
      {
        status: 'success',
        message: `Function ${ result.slug } has been successfully edited.`,
        data: result,
      },
      {
        status: 200,
      }
    );
  });
}

