import { getAuthSession } from '@app/auth/session';
import { CodeEditorView } from '@protected/functions/CodeEditorView';
import { notFound } from 'next/navigation';

export default async function Page({ params }: { params: { paths: string[] } }) {
  const paths = params.paths || [];
  const authSession = await getAuthSession();

  if (!authSession) {
    return notFound();
  }

  return (
    <div className="px-4" data-testid="functions-new-page">
      <div className="block">
        <div className="mb-4">
          <h1 className="text-base font-semibold leading-10">Add New Function</h1>
        </div>
        <div className="block">
          <CodeEditorView authSession={authSession} />
        </div>
      </div>
    </div>
  );
}
