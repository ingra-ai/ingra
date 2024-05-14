import { getAuthSession } from '@app/auth/session';
import db from '@lib/db';
import { CodeEditorView } from '@protected/functions/CodeEditorView';
import { RedirectType, notFound, redirect } from 'next/navigation';


export default async function Page({ params }: { params: { paths: string[] } }) {
  const paths = params.paths || [];
  const authSession = await getAuthSession();

  // Function ID from the URL segments of 2;
  const functionId = paths?.[1];

  if ( !functionId || !authSession ) {
    return notFound();
  }

  const functionRecord = await db.function.findUnique({
    where: {
      id: functionId,
      ownerUserId: authSession.user.id,
    },
    include: {
      arguments: true
    },
  });

  if ( !functionRecord ) {
    return redirect('/functions', RedirectType.replace);
  }

  return (
    <div className="block px-4" data-testid="functions-edit-page">
      <div className="mb-4">
        <h1 className="text-base font-semibold leading-10">Edit Function</h1>
      </div>
      <div className="block">
        <CodeEditorView authSession={authSession} functionRecord={functionRecord} />
      </div>
    </div>
  );
}
