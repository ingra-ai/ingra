import { FunctionForm } from '@repo/components/data/functions/mine/FunctionForm';
import { getAuthSession } from '@repo/shared/data/auth/session';
import { notFound } from 'next/navigation';

export default async function Page({ params }: { params: { ownerUsername: string } }) {
  const authSession = await getAuthSession();
  const { ownerUsername } = params;

  if (!authSession) {
    return notFound();
  }

  return (
    <div className="block" data-testid="functions-new-page">
      <div className="block">
        <div className="mb-4">
          <h1 className="text-base font-semibold leading-10">Add New Function</h1>
        </div>
        <div className="block">
          <FunctionForm authSession={authSession} ownerUsername={ownerUsername} />
        </div>
      </div>
    </div>
  );
}
