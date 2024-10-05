import { notFound } from 'next/navigation';
import { getAuthSession } from '@repo/shared/data/auth/session';
import SwaggerDocs from '@app/api/(internal)/swagger/SwaggerDocs';
import { getMyCollectionAuthSpec } from '../openapi.json/getMyCollectionAuthSpec';
import { getCommunityCollectionSpec } from '../openapi.json/getCommunityCollectionSpec';
import '@css/swagger.scss';

export default async function Page({ params }: { params: { userName: string; collectionSlug: string } }) {
  const authSession = await getAuthSession();
  const { userName, collectionSlug } = params;
  const itsMe = Boolean(authSession?.user.profile?.userName && authSession.user.profile.userName === userName);

  if ( !authSession ) {
    return notFound();
  }

  const swaggerSpec = ( itsMe && authSession )? await getMyCollectionAuthSpec(authSession, userName, collectionSlug) : await getCommunityCollectionSpec(authSession, userName, collectionSlug);

  if (!swaggerSpec) {
    return notFound();
  }

  return (
    <section className="container">
      {swaggerSpec ? (
        <SwaggerDocs spec={swaggerSpec} />
      ) : (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <h1 className="text-2xl font-bold">No Swagger Spec Found</h1>
            <p className="text-gray-600">Please check the username in the URL and try again.</p>
          </div>
        </div>
      )}
    </section>
  );
}
