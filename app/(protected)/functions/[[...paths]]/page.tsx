import { getAuthSession } from '@app/auth/session';
// import { AddFunctionButton } from './AddFunctionButton';
import db from '@lib/db';
import { notFound } from 'next/navigation';


export default async function Page({ params }: { params: { paths: string[] } }) {
  const paths = params.paths || [];

  return (
    <div className="" data-testid="functions-page">
    </div>
  );
}
