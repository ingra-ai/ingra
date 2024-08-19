import { getAuthSession } from '@app/auth/session';
import { APP_AUTH_LOGIN_URL, USER_API_ROOT_URL } from '@lib/constants';
import { redirect, RedirectType } from 'next/navigation';
import { BracesIcon } from 'lucide-react';
import { OpenAPISpecLoader } from './OpenAPISpecLoader';

export default async function Page() {
  const authSession = await getAuthSession();

  if (!authSession) {
    redirect(APP_AUTH_LOGIN_URL, RedirectType.replace);
  }

  const userOpenApiUrl = USER_API_ROOT_URL + '/me/openapi.json';
  const userSwaggerUrl = USER_API_ROOT_URL + '/me/swagger';

  return (
    <div className="relative">
      <h1 className="text-base font-semibold leading-10">
        <BracesIcon className="inline-block mr-2 w-5 h-5" />
        Open API
      </h1>
      <p className="text-xs text-gray-500 font-sans">
        You can find the Open API specification for your API below. or you can view it in the <a href={ userSwaggerUrl } target="_blank" rel="noreferrer" className="text-amber-500 underline" title='Swagger UI'>Swagger UI</a>.
      </p>
      <div className="mt-8">
        <OpenAPISpecLoader openapiUrl={ userOpenApiUrl } />
      </div>
    </div>
  );
}
