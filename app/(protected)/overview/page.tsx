import { getAuthSession } from '@app/auth/session';
import { APP_AUTH_LOGIN_URL, APP_PROFILE_URL, USERS_API_ROOT_URL } from '@lib/constants';
import Link from 'next/link';
import { redirect, RedirectType } from 'next/navigation';

export default async function Dashboard() {
  const authSession = await getAuthSession();

  if (!authSession || authSession.expiresAt < new Date()) {
    redirect(APP_AUTH_LOGIN_URL, RedirectType.replace);
  }

  const userProfile = authSession.user?.profile;

  let userApiBaseUrl = '';
  if (userProfile?.userName) {
    userApiBaseUrl = USERS_API_ROOT_URL.replace(':username', userProfile?.userName)
  }

  const userOpenApiUrl = userApiBaseUrl ? userApiBaseUrl + '/openapi.json' : '';
  const userSwaggerUrl = userApiBaseUrl ? userApiBaseUrl + '/swagger' : '';
  
  return (
    <div className="container mx-auto">
      <h1 className="text-lg mb-6">Setting up</h1>
      {
        userApiBaseUrl ? (
          <table className="min-w-full divide-y divide-gray-700">
            {
              userOpenApiUrl && (
                <tr>
                  <td>
                    <p className="font-medium">
                      OpenAPI URL
                    </p>
                  </td>
                  <td>
                    <a href={ userOpenApiUrl } target="_blank" className="underline"> { userOpenApiUrl } </a>
                  </td>
                </tr>
              )
            }
            {
              userSwaggerUrl && (
                <tr>
                  <td>
                    <p className="font-medium">
                      Swagger URL
                    </p>
                  </td>
                  <td>
                    <a href={ userSwaggerUrl } target="_blank" className="underline"> { userSwaggerUrl } </a>
                  </td>
                </tr>
              )
            }
          </table>
        ) : (
          <p className="">
            Please visit your <a href={ APP_PROFILE_URL } target="_self" className="underline">profile</a> to set up your account.
          </p>
        )
      }
    </div>
  );
}
