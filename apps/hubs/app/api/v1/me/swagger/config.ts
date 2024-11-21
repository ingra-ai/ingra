import { AuthSessionResponse } from '@repo/shared/data/auth/session/types';
import { APP_NAME, APP_OPENAI_MANIFEST_DESC_FOR_HUMAN } from '@repo/shared/lib/constants';
import isEmpty from 'lodash/isEmpty';

import { getBaseSwaggerSpec } from '@app/api/(internal)/swagger/getBaseSwaggerSpec';
import { generateOpenApiSchema } from '@v1/me/swagger/generateOpenApiSchema';

export const getAuthSwaggerSpec = async (authSession: AuthSessionResponse) => {
  if (!authSession) {
    return null;
  }

  const username = authSession?.user?.profile?.userName || authSession.user.email;

  const [userFunctionsPaths, baseSwaggerSpec] = await Promise.all([generateOpenApiSchema(authSession), getBaseSwaggerSpec()]);

  const mySwaggerSpec: Record<string, any> = {
    ...(baseSwaggerSpec || {}),
    // Clear the paths
    paths: {},
  };

  if (isEmpty(mySwaggerSpec)) {
    return null;
  }

  // Clear components schemas if its not ApiError or ApiSuccess
  if (mySwaggerSpec?.components?.schemas) {
    const schemas = Object.keys(mySwaggerSpec.components.schemas);
    for (const schema of schemas) {
      if (schema !== 'ApiError' && schema !== 'ApiSuccess') {
        delete mySwaggerSpec.components.schemas[schema];
      }
    }
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
