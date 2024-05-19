import { getAuthSession } from '@app/auth/session';
import db from '@lib/db';
import FunctionsList from './FunctionList';
import { cn } from '@lib/utils';
import { notFound } from 'next/navigation';
import { FunctionListGetPayload } from './types';
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
  
  if ( !authSession ) {
    return notFound();
  }

  // Get all functions
  const allFunctions = await db.function.findMany({
    where: {
      ownerUserId: authSession.user.id,
    },
    orderBy: {
      updatedAt: 'desc',
    },
    select: {
      id: true,
      slug: true,
      code: false,
      description: true,
      httpVerb: true,
      isPrivate: true,
      isPublished: true,
      ownerUserId: true,
      createdAt: false,
      updatedAt: true,
      tags: {
        select: {
          id: true,
          name: true,
          functionId: false,
          function: false,
        }
      },
      arguments: {
        select: {
          id: true,
          name: true,
          description: false,
          type: true,
          defaultValue: false,
          isRequired: false,
        }
      }
    }
  });

  const functionListGridClasses = cn({
    'grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6': true
  });

  return (
    <div className="block" data-testid="functions-list-page">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold leading-6">Functions ({ allFunctions.length })</h1>
          <p className="mt-2 text-sm">
            &nbsp;
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
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
