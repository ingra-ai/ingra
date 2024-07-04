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

type ConvertFunctionRecordOptions = {
  transformHitUrl: (functionSlug: string) => string;
}

export function convertFunctionRecordToOpenApiSchema(functionRecord: FunctionPayload, opts: ConvertFunctionRecordOptions) {
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
    tags: functionRecord.tags.map(tag => tag.name) || []
  };

  switch (functionRecord.httpVerb) {
    case 'DELETE':
    case 'GET':
      pathItem.parameters = parameters;
      break;
    case 'POST':
    case 'PUT':
    case 'PATCH':
      pathItem.requestBody = requestBody;
      break;
    default:
      throw new Error(`Unsupported HTTP verb: ${functionRecord.httpVerb}`);
  }

  return {
    [opts.transformHitUrl(functionRecord.slug)]: {
      [functionRecord.httpVerb.toLowerCase()]: pathItem
    }
  };
}
