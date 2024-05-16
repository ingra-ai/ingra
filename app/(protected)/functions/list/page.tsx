import { getAuthSession } from '@app/auth/session';
import db from '@lib/db';
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

export default async function Page() {
  const authSession = await getAuthSession();

  // Get all functions
  const allFunctions = authSession && await db.function.findMany({
    where: {
      ownerUserId: authSession.user.id,
    },
    orderBy: {
      updatedAt: 'desc',
    },
    select: {
      id: true,
      slug: true,
      description: true,
      httpVerb: true,
      isPrivate: true,
      ownerUserId: true,
      updatedAt: true,
      arguments: {
        select: {
          id: true,
          name: true,
          type: true
        }
      }
    }
  });

  const functionListGridClasses = cn({
    'grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6': true
  });

  return (
    <div className="block" data-testid="functions-view-page">
      <div className="flex items-center px-2">
        <div className="flex-grow">
          <h1 className="text-base font-semibold leading-10">Functions ({allFunctions?.length || 0})</h1>
        </div>
        <div className="block">
          <div className="flex items-center justify-center">
          </div>
        </div>
      </div>
      <div className="mt-4">
        <div className={functionListGridClasses}>
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
