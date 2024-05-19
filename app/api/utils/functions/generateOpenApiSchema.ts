import { AuthSessionResponse } from "@app/auth/session";
import { USERS_API_FUNCTION_PATH } from "@lib/constants";
import db from "@lib/db";
import { Prisma } from "@prisma/client";

type FunctionPayload = Prisma.FunctionGetPayload<{
  include: {
    id: false,
    code: false,
    isPrivate: false,
    ownerUserId: false,
    httpVerb: true,
    slug: true,
    description: true,
    arguments: true,
  }
}>;

export function convertFunctionRecordToOpenApiSchema( functionRecord: FunctionPayload, username: string ) {
  const parameters = functionRecord.arguments.map(arg => ({
    name: arg.name,
    in: 'query',
    description: arg.description,
    required: arg.isRequired,
    schema: {
      type: arg.type === 'number' ? 'integer' : arg.type, // Adjust for OpenAPI type
      default: arg.defaultValue
    }
  }));


  let functionHitUrl = '';
  if ( username && functionRecord.slug ) {
    functionHitUrl = USERS_API_FUNCTION_PATH
      .replace(':username', username)
      .replace(':slug', functionRecord.slug);
  }

  return {
    [`/${ functionHitUrl }`]: {
      [functionRecord.httpVerb.toLowerCase()]: {
        summary: functionRecord.description,
        operationId: functionRecord.slug,
        description: functionRecord.description,
        parameters,
        responses: {
          '200': {
            description: 'Successfully retrieved records.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ApiSuccess'
                }
              }
            }
          },
          '400': {
            description: 'Bad request, such as missing or invalid parameters.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ApiError'
                }
              }
            }
          }
        },
        tags: []
      }
    }
  };
}

export async function generateOpenApiSchema( authSession: AuthSessionResponse ) {
  if ( !authSession ) {
    return null;
  }

  const functionRecords = await db.function.findMany({
    where: {
      ownerUserId: authSession.user.id,
    },
    select: {
      id: false,
      code: false,
      isPrivate: false,
      ownerUserId: false,
      httpVerb: true,
      slug: true,
      description: true,
      arguments: true
    }
  });

  const username = authSession?.user?.profile?.userName || '';

  const openApiSchema = functionRecords.reduce((acc, functionRecord) => {
    const functionSchema = convertFunctionRecordToOpenApiSchema(functionRecord as any, username);
    return { ...acc, ...functionSchema };
  }, {});

  return openApiSchema;
}