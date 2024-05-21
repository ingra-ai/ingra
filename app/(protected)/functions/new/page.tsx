import { getAuthSession } from '@app/auth/session';
import { notFound } from 'next/navigation';
import { FunctionForm } from '@protected/functions/FunctionForm';

export default async function Page() {
  const authSession = await getAuthSession();

  if ( !authSession ) {
    return notFound();
  }

  return (
    <div className="block" data-testid="functions-new-page">
      <div className="block">
        <div className="mb-4">
          <h1 className="text-base font-semibold leading-10">Add New Function</h1>
        </div>
        <div className="block">
          <FunctionForm />
        </div>
      </div>
    </div>
  );
}
