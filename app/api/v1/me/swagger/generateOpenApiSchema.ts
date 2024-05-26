import { AuthSessionResponse } from "@app/auth/session/types";
import { USERS_API_FUNCTION_PATH, USERS_API_FUNCTION_SUBSCRIPTIONS_PATH } from "@lib/constants";
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
    tags: true,
  }
}>;

function convertFunctionRecordToOpenApiSchema(functionRecord: FunctionPayload, isSubscription = false) {
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

  const requestBody = {
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: functionRecord.arguments.reduce((acc, arg) => {
            acc[arg.name] = {
              type: arg.type === 'number' ? 'integer' : arg.type,
              description: arg.description,
              default: arg.defaultValue
            };
            return acc;
          }, {} as Record<string, any>),
          required: functionRecord.arguments.filter(arg => arg.isRequired).map(arg => arg.name)
        }
      }
    }
  };

  let functionHitUrl = '';
  if (functionRecord.slug) {
    if ( isSubscription ) {
      functionHitUrl = USERS_API_FUNCTION_SUBSCRIPTIONS_PATH.replace(':slug', functionRecord.slug);
    }
    else {
      functionHitUrl = USERS_API_FUNCTION_PATH.replace(':slug', functionRecord.slug);
    }
  }

  const pathItem: Record<string, any> = {
    summary: functionRecord.description,
    operationId: functionRecord.slug,
    description: functionRecord.description,
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
    tags: functionRecord.tags.map( tag => tag.name ) || []
  };

  switch (functionRecord.httpVerb) {
    case 'GET':
      pathItem.parameters = parameters;
      break;
    case 'POST':
    case 'PUT':
    case 'PATCH':
      pathItem.requestBody = requestBody;
      break;
    case 'DELETE':
      pathItem.parameters = parameters;
      break;
    default:
      throw new Error(`Unsupported HTTP verb: ${functionRecord.httpVerb}`);
  }

  return {
    [functionHitUrl]: {
      [functionRecord.httpVerb.toLowerCase()]: pathItem
    }
  };
}

export async function generateOpenApiSchema( authSession: AuthSessionResponse ) {
  if ( !authSession || !authSession.user.id ) {
    return null;
  }

  const [functionRecords, subscribedFunctionRecords] = await Promise.all([
    // 1. Fetch all functions from user's own repository.
    db.function.findMany({
      where: {
        ownerUserId: authSession.user.id,
        isPublished: true
      },
      select: {
        id: false,
        code: false,
        isPrivate: false,
        ownerUserId: false,
        httpVerb: true,
        slug: true,
        description: true,
        arguments: true,
        tags: true,
      }
    }),

    // 2. Fetch all function subscriptions that user has subscribed to.
    db.function.findMany({
      where: {
        subscribers: {
          some: {
            userId: authSession.user.id
          }
        },
        isPublished: true,
        isPrivate: false
      },
      select: {
        id: false,
        code: false,
        isPrivate: false,
        ownerUserId: false,
        httpVerb: true,
        slug: true,
        description: true,
        arguments: true,
        tags: true,
      }
    })
  ]);

  const usersFunctionsOpenApiSchema = functionRecords.reduce((acc, functionRecord) => {
    const functionSchema = convertFunctionRecordToOpenApiSchema(functionRecord as any);
    return { ...acc, ...functionSchema };
  }, {});

  const usersSubscribedFunctionsOpenApiSchema = subscribedFunctionRecords.reduce((acc, functionRecord) => {
    const functionSchema = convertFunctionRecordToOpenApiSchema(functionRecord as any, true);
    return { ...acc, ...functionSchema };
  }, {});

  return {
    ...usersSubscribedFunctionsOpenApiSchema,
    ...usersFunctionsOpenApiSchema
  };
}
