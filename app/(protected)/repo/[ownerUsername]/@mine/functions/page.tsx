import { getAuthSession } from '@app/auth/session';
import FunctionsList from './FunctionList';
import { cn } from '@lib/utils';
import { notFound } from 'next/navigation';
import { BakaPagination } from '@components/BakaPagination';
import { fetchPaginationData } from './fetchPaginationData';
import { getCollectionsByUserId } from '@data/collections/getCollectionsByUserId';

export default async function Page(
  { searchParams, params }: {
    searchParams: Record<string, string | string[] | undefined>;
    params: { ownerUsername: string };
  }
) {
  const authSession = await getAuthSession();
  
  if ( !authSession ) {
    return notFound();
  }

  const [paginationData, collections] = await Promise.all([
      fetchPaginationData(searchParams, authSession.user.id),

      // Fetch all collections for the user
      getCollectionsByUserId( authSession.user.id )
    ]),
    { records, ...paginationProps } = paginationData;

  const functionListGridClasses = cn({
    'grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6': true
  });

  return (
    <div className="block" data-testid="functions-list-page">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold leading-6">My Functions</h1>
          <p className="text-xs text-gray-500 font-sans mt-1">
            # records: <strong>{paginationProps.totalRecords.toLocaleString(undefined, { minimumFractionDigits: 0 })}</strong>
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
        </div>
      </div>
      <div className="mt-4">
        <BakaPagination className="mb-4" { ...paginationProps } />
        <div className={functionListGridClasses}>
          {
            <FunctionsList ownerUsername={params.ownerUsername} functions={records} collections={collections} />
          }
        </div>
      </div>
    </div>
  );
}
