/**
 * Swagger to use in the app and for creating OpenAI
 * @see https://platform.openai.com/docs/plugins/getting-started/openapi-definition
 * @see https://platform.openai.com/docs/plugins/examples To create your first plugin with OAuth
 */

import { generateOpenApiSchema } from '@app/api/utils/functions/generateOpenApiSchema';
import { AuthSessionResponse } from "@app/auth/session/types";
import { APP_NAME, APP_OPENAI_MANIFEST_DESC_FOR_HUMAN, APP_PACKAGE_VERSION } from '@lib/constants';
import { createSwaggerSpec } from 'next-swagger-doc';

export type SwaggerOptions = NonNullable<Parameters<typeof createSwaggerSpec>[0]>;

export const getAuthSwaggerSpec = async (authSession: AuthSessionResponse) => {
  if ( !authSession ) {
    return null;
  }

  const username = authSession?.user?.profile?.userName || authSession.user.email;

  const userFunctionsPaths = await generateOpenApiSchema(authSession);

  const swaggerOptions: SwaggerOptions = {
    apiFolder: `app/api/v1`, // define api folder under app folder
    apis: [],
    definition: {
      openapi: '3.0.0',
      info: {
        title: `${ username } | ${APP_NAME} Plugin API`,
        version: APP_PACKAGE_VERSION,
        description: APP_OPENAI_MANIFEST_DESC_FOR_HUMAN,
      },
      paths: {
        ...userFunctionsPaths,
      },
      components: {
        /**
         * @todo These schemas should be auto-generated from app/api/v1/types, but providing the path in `apis` is not working
         */
        schemas: {
          ApiError: {
            type: "object",
            required: [
              "message"
            ],
            properties: {
              status: {
                type: "integer",
                format: "int32",
                description: "An optional error code representing the error type. For example, 400 for Bad Request, 401 for Unauthorized, 403 for Forbidden, 404 for Not Found, 500 for Internal Server Error."
              },
              code: {
                type: "string",
                nullable: true,
                description: "A brief description of the error message."
              },
              message: {
                type: "string",
                description: "A detailed message describing the error message."
              }
            }
          },
          ApiSuccess: {
            type: "object",
            required: [
              "status",
              "message"
            ],
            properties: {
              status: {
                type: "string",
                description: "A brief description of the successful operation.",
                example: "OK"
              },
              message: {
                type: "string",
                description: "A brief message of the successful operation.",
                example: "Operation successful."
              },
              data: {
                oneOf: [
                  {
                    type: "object",
                    additionalProperties: true,
                    description: "An arbitrary object returned by the operation."
                  },
                  {
                    type: "array",
                    items: {
                      type: "object",
                      additionalProperties: true
                    },
                    description: "An array of arbitrary objects returned by the operation."
                  }
                ]
              }
            }
          }
        }
      },
      security: [],
    },
  };

  const spec = createSwaggerSpec(swaggerOptions);
  return spec;
};
