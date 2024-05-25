import { BASE_SWAGGER_SPEC_KEY, SwaggerOptions } from '@app/api/(internal)/swagger/config';
import { AuthSessionResponse } from "@app/auth/session/types";
import { APP_NAME, APP_OPENAI_MANIFEST_DESC_FOR_HUMAN } from '@lib/constants';
import { generateOpenApiSchema } from '@v1/me/swagger/generateOpenApiSchema';
import { kv } from '@vercel/kv';

export const getAuthSwaggerSpec = async (authSession: AuthSessionResponse) => {
  if ( !authSession ) {
    return null;
  }

  const username = authSession?.user?.profile?.userName || authSession.user.email;

  const [userFunctionsPaths, baseSwaggerSpec] = await Promise.all([
    generateOpenApiSchema(authSession),
    kv.get<SwaggerOptions>(BASE_SWAGGER_SPEC_KEY),
  ]);

  if ( !baseSwaggerSpec ) {
    return null;
  }
  
  const meSwaggerSpec = { ...baseSwaggerSpec };

  /**
   * Update the title and description of the swagger
   */
  if ( meSwaggerSpec?.info ) {
    Object.assign(meSwaggerSpec.info, {
      title: `${ username } | ${APP_NAME} Plugin API`,
      description: APP_OPENAI_MANIFEST_DESC_FOR_HUMAN,
    });
  }

  if ( meSwaggerSpec?.paths && userFunctionsPaths ) {
    Object.assign(meSwaggerSpec.paths, userFunctionsPaths);
  }

  return meSwaggerSpec;
};
