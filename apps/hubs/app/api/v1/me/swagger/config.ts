import {
  BASE_SWAGGER_SPEC_KEY,
  SwaggerOptions,
  getSwaggerSpec,
} from "@app/api/(internal)/swagger/config";
import { AuthSessionResponse } from "@repo/shared/data/auth/session/types";
import {
  APP_NAME,
  APP_OPENAI_MANIFEST_DESC_FOR_HUMAN,
} from "@repo/shared/lib/constants";
import { generateOpenApiSchema } from "@v1/me/swagger/generateOpenApiSchema";
import { kv } from "@vercel/kv";
import isEmpty from "lodash/isEmpty";

export const getAuthSwaggerSpec = async (authSession: AuthSessionResponse) => {
  if (!authSession) {
    return null;
  }

  const username =
    authSession?.user?.profile?.userName || authSession.user.email;

  const [userFunctionsPaths, baseSwaggerSpecCache, baseSwaggerSpec] =
    await Promise.all([
      generateOpenApiSchema(authSession),
      kv.get<SwaggerOptions>(BASE_SWAGGER_SPEC_KEY),
      getSwaggerSpec(false),
    ]);

  const mySwaggerSpec = {
    ...(baseSwaggerSpec || {}),
    ...(baseSwaggerSpecCache || {}),
  };

  if (isEmpty(mySwaggerSpec)) {
    return null;
  }

  /**
   * Update the title and description of the swagger
   */
  if (mySwaggerSpec?.info) {
    Object.assign(mySwaggerSpec.info, {
      title: `${username} | ${APP_NAME} Plugin API`,
      description: APP_OPENAI_MANIFEST_DESC_FOR_HUMAN,
    });
  }

  if (mySwaggerSpec?.paths && userFunctionsPaths) {
    Object.assign(mySwaggerSpec.paths, userFunctionsPaths);
  }

  return mySwaggerSpec;
};
