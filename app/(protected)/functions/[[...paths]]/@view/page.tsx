import { getAuthSession } from '@app/auth/session';
import db from '@lib/db';
import { CodeXml } from 'lucide-react';
import Link from 'next/link';
import FunctionsList from './FunctionList';
import { cn } from '@lib/utils';
// import {
//   Pagination,
//   PaginationContent,
//   PaginationEllipsis,
//   PaginationItem,
//   PaginationLink,
//   PaginationNext,
//   PaginationPrevious,
// } from "@/components/ui/pagination"

export default async function Page({ params }: { params: { paths: string[] } }) {
  const authSession = await getAuthSession();

  // If the view is new, edit, or run - the view is split 50|50 on the screen.
  const isSplitView = Array.isArray( params.paths ) && params.paths.length > 0;

  // Get all functions
  const allFunctions = authSession && await db.function.findMany({
    where: {
      ownerUserId: authSession.user.id,
    },
    orderBy: {
      updatedAt: 'desc',
    },
  });

  const functionListGridClasses = cn({
    'grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6': !isSplitView,
    'grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 3xl:grid-cols-4': isSplitView
  });

  return (
    <div className="" data-testid="functions-view-page">
      <div className="flex items-center px-2">
        <div className="flex-grow">
          <h1 className="text-base font-semibold leading-10">Functions ({ allFunctions?.length || 0 })</h1>
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
        <div className={ functionListGridClasses }>
          {
            allFunctions && (
              <FunctionsList functions={allFunctions} />
            )
          }
        </div>
      </div>
    </div>
  );
}
