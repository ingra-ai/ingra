import { getSwaggerSpec } from '@app/api/(internal)/swagger/config';
import { generateOpenApiSchema } from '@app/api/utils/functions/generateOpenApiSchema';
import { AuthSessionResponse } from "@app/auth/session/types";
import { APP_NAME, APP_OPENAI_MANIFEST_DESC_FOR_HUMAN } from '@lib/constants';

export const getAuthSwaggerSpec = async (authSession: AuthSessionResponse) => {
  if ( !authSession ) {
    return null;
  }

  const username = authSession?.user?.profile?.userName || authSession.user.email;

  const userFunctionsPaths = await generateOpenApiSchema(authSession);

  return getSwaggerSpec({
    title: `${ username } | ${APP_NAME} Plugin API`,
    description: APP_OPENAI_MANIFEST_DESC_FOR_HUMAN,
    extraPaths: {
      ...( userFunctionsPaths || {} )
    },
  });
};
