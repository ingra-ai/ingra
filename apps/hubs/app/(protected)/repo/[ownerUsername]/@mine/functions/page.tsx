import { getAuthSession } from '@repo/shared/data/auth/session';
import { cn } from '@repo/shared/lib/utils';
import { notFound } from 'next/navigation';
import { BakaPagination } from '@repo/components/BakaPagination';
import { fetchPaginationData } from './fetchPaginationData';
import { getCollectionsByUserId } from '@repo/shared/data/collections/getCollectionsByUserId';
import FunctionsList from '@repo/components/data/functions/mine/FunctionList';
import { Metadata, ResolvingMetadata } from 'next';
import { APP_NAME } from '@repo/shared/lib/constants';

type Props = {
  params: { ownerUsername: string }
  searchParams: { [key: string]: string | string[] | undefined }
}

export async function generateMetadata(
  { params, searchParams }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { ownerUsername } = params;
 
  return {
    title: ['My Functions', APP_NAME].join(' | '),
  }
}

export default async function Page({ searchParams, params }: Props) {
  const authSession = await getAuthSession();

  if (!authSession) {
    return notFound();
  }

  const [paginationData, collections] = await Promise.all([
      fetchPaginationData(searchParams, authSession.user.id),

      // Fetch all collections for the user
      getCollectionsByUserId(authSession.user.id),
    ]),
    { records, ...paginationProps } = paginationData;

  const functionListGridClasses = cn({
    'grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6': true,
  });

  return (
    <div className="block" data-testid="functions-list-page">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold leading-6">My Functions</h1>
          <p className="text-xs text-gray-500 font-sans mt-1">
            # records:{' '}
            <strong>
              {paginationProps.totalRecords.toLocaleString(undefined, {
                minimumFractionDigits: 0,
              })}
            </strong>
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none"></div>
      </div>
      <div className="mt-4">
        <BakaPagination className="mb-4" {...paginationProps} />
        <div className={functionListGridClasses}>{<FunctionsList ownerUsername={params.ownerUsername} functions={records} collections={collections} />}</div>
      </div>
    </div>
  );
}
