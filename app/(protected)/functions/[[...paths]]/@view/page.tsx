import { getAuthSession } from '@app/auth/session';
import db from '@lib/db';
import { CodeXml } from 'lucide-react';
import Link from 'next/link';
import FunctionsList from './FunctionList';

export default async function Page() {
  const authSession = await getAuthSession();

  // Get all functions
  const allFunctions = authSession && await db.function.findMany({
    where: {
      ownerUserId: authSession.user.id,
    },
  });

  return (
    <div className="" data-testid="functions-view-page">
      <div className="flex items-center px-2">
        <div className="flex-grow">
          <h1 className="text-base font-semibold leading-10">Functions</h1>
        </div>
        <div className="block">
          <div className="flex items-center justify-center">
            <Link
              href={'/functions/new'}
              className="relative inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-secondary-foreground bg-secondary hover:bg-secondary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary-hover"
            >
              New&nbsp;<CodeXml aria-label='code' />
            </Link>
          </div>
        </div>
      </div>
      <div className="mt-4">
        {
          allFunctions && (
            <FunctionsList functions={allFunctions} />
          )
        }
      </div>
    </div>
  );
}
