import { getAuthSession } from '@app/auth/session';
import { notFound } from 'next/navigation';

export default async function Page({ params }: { params: { paths: string[] } }) {
  const authSession = await getAuthSession();

  if ( !authSession ) {
    return notFound();
  }

  console.log({ params })

  return (
    <div className="block" data-testid="functions-browse-page">
      <div className="mb-4">
        <h1 className="text-base font-semibold leading-10">Browse</h1>
      </div>
      <div className="block">
        Coming soon...
      </div>
    </div>
  );
}
