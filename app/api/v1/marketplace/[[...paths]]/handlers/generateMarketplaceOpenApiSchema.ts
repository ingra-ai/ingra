import { MARKETPLACE_API_FUNCTION_PATH } from "@lib/constants";
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

function convertFunctionRecordToOpenApiSchema(functionRecord: FunctionPayload, username: string) {
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

  // Hardcoding the required fields for the marketplace
  const userVarsParameter = [
    {
      name: 'userVars',
      in: 'query',
      description: 'User variables including oauth tokens, profile, and environment variables',
      required: true,
      schema: {
        type: 'object',
        properties: {
          oauthTokens: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                scope: { type: 'string', example: 'read:email' },
                tokenType: { type: 'string', example: 'Bearer' },
                service: { type: 'string', example: 'google' },
                idToken: { type: 'string', example: 'eyJhbGci...' },
                accessToken: { type: 'string', example: 'ya29.a0AfH6SM...' },
                primaryEmailAddress: { type: 'string', example: 'user@example.com' }
              }
            }
          },
          profile: {
            type: 'object',
            properties: {
              userName: { type: 'string', example: 'johndoe' },
              timeZone: { type: 'string', example: 'America/New_York' }
            }
          },
          envVars: {
            type: 'object',
            additionalProperties: { type: 'string' },
            example: {
              API_KEY: '12345',
              SECRET_KEY: 'abcdef'
            }
          }
        }
      }
    }
  ];

  const combinedParameters = [...parameters, ...userVarsParameter];

  const requestBody = {
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            ...functionRecord.arguments.reduce((acc, arg) => {
              acc[arg.name] = {
                type: arg.type === 'number' ? 'integer' : arg.type,
                description: arg.description,
                default: arg.defaultValue
              };
              return acc;
            }, {} as Record<string, any>),
            userVars: {
              type: 'object',
              properties: {
                oauthTokens: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      scope: { type: 'string', example: 'read:email' },
                      tokenType: { type: 'string', example: 'Bearer' },
                      service: { type: 'string', example: 'google' },
                      idToken: { type: 'string', example: 'eyJhbGci...' },
                      accessToken: { type: 'string', example: 'ya29.a0AfH6SM...' },
                      primaryEmailAddress: { type: 'string', example: 'user@example.com' }
                    }
                  }
                },
                profile: {
                  type: 'object',
                  properties: {
                    userName: { type: 'string', example: 'johndoe' },
                    timeZone: { type: 'string', example: 'America/New_York' }
                  }
                },
                envVars: {
                  type: 'object',
                  additionalProperties: { type: 'string' },
                  example: {
                    API_KEY: '12345',
                    SECRET_KEY: 'abcdef'
                  }
                }
              },
              example: {
                oauthTokens: [
                  {
                    scope: 'read:email',
                    tokenType: 'Bearer',
                    service: 'google',
                    idToken: 'eyJhbGci...',
                    accessToken: 'ya29.a0AfH6SM...',
                    primaryEmailAddress: 'user@example.com'
                  }
                ],
                profile: {
                  userName: 'johndoe',
                  timeZone: 'America/New_York'
                },
                envVars: {
                  API_KEY: '12345',
                  SECRET_KEY: 'abcdef'
                }
              }
            },
          },
          required: [
            ...functionRecord.arguments.filter(arg => arg.isRequired).map(arg => arg.name)
          ]
        }
      }
    }
  };

  let functionHitUrl = '';
  if (username && functionRecord.slug) {
    functionHitUrl = MARKETPLACE_API_FUNCTION_PATH.replace(':username', username).replace(':slug', functionRecord.slug);
  }
  else {
    return {};
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
      pathItem.parameters = combinedParameters;
      break;
    case 'POST':
    case 'PUT':
    case 'PATCH':
      pathItem.requestBody = requestBody;
      break;
    case 'DELETE':
      pathItem.parameters = combinedParameters;
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

export async function generateMarketplaceOpenApiSchema() {
  const functionRecords = await db.function.findMany({
    where: {
      isPublished: true,
      isPrivate: false,
    },
    orderBy: {
      updatedAt: 'desc',
    },
    select: {
      id: false,
      code: false,
      isPrivate: false,
      owner: {
        select: {
          profile: {
            select: {
              userName: true,
            }
          }
        }
      },
      httpVerb: true,
      slug: true,
      description: true,
      arguments: true,
      tags: true,
    },
    take: 30
  });

  const openApiSchema = functionRecords.reduce((acc, functionRecord) => {
    const username = functionRecord?.owner?.profile?.userName || '';
    const functionSchema = convertFunctionRecordToOpenApiSchema(functionRecord as any, username);
    return { ...acc, ...functionSchema };
  }, {});

  return openApiSchema;
}