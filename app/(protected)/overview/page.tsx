import { getAuthSession } from '@app/auth/session';
import { APP_AUTH_LOGIN_URL, USERS_API_ROOT_URL } from '@lib/constants';
import { redirect, RedirectType } from 'next/navigation';

export default async function Dashboard() {
  const authSession = await getAuthSession();

  if (!authSession) {
    redirect(APP_AUTH_LOGIN_URL, RedirectType.replace);
  }

  const userOpenApiUrl = USERS_API_ROOT_URL + '/openapi.json';
  const userSwaggerUrl = USERS_API_ROOT_URL + '/swagger';

  return (
    <div className="container mx-auto">
      <h1 className="text-lg mb-6">Setting up</h1>
      <table className="min-w-full divide-y divide-gray-700">
        <tr>
          <td>
            <p className="font-medium">
              OpenAPI URL
            </p>
          </td>
          <td>
            <a href={userOpenApiUrl} target="_blank" className="underline"> {userOpenApiUrl} </a>
          </td>
        </tr>
        <tr>
          <td>
            <p className="font-medium">
              Swagger URL
            </p>
          </td>
          <td>
            <a href={userSwaggerUrl} target="_blank" className="underline"> {userSwaggerUrl} </a>
          </td>
        </tr>
      </table>
    </div>
  );
}
