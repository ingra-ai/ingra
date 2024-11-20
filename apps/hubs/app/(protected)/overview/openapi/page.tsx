import { getAuthSession } from '@repo/shared/data/auth/session';
import { APP_AUTH_LOGIN_URL, ME_API_ROOT_URL } from '@repo/shared/lib/constants';
import { BracesIcon } from 'lucide-react';
import { headers } from 'next/headers';
import { redirect, RedirectType } from 'next/navigation';

import { OpenAPISpecLoader } from '@/components/openapi/OpenAPISpecLoader';


export default async function Page() {
  const authSession = await getAuthSession();
  const headersList = await headers(),
    headerUrl = headersList.get('X-URL') || '',
    redirectToQuery = headerUrl ? `?redirectTo=${encodeURIComponent(headerUrl)}` : '';

  if (!authSession) {
    redirect(APP_AUTH_LOGIN_URL + redirectToQuery, RedirectType.replace);
  }

  const userOpenApiUrl = ME_API_ROOT_URL + '/openapi.json';
  const userSwaggerUrl = ME_API_ROOT_URL + '/swagger';

  return (
    <div className="flex flex-col h-full w-full">
      <h1 className="text-base font-semibold leading-10">
        <BracesIcon className="inline-block mr-2 w-5 h-5" />
        Open API
      </h1>
      <p className="text-xs text-gray-500 font-sans">
        You can find the Open API specification for your API below. or you can view it in the{' '}
        <a href={userSwaggerUrl} target="_blank" rel="noreferrer" className="text-amber-500 underline" title="Swagger UI">
          Swagger UI
        </a>
        .
      </p>
      <OpenAPISpecLoader className="flex-1 mt-8 mb-8" openapiUrl={userOpenApiUrl} />
    </div>
  );
}
