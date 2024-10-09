'use client';
import { PlusIcon } from '@heroicons/react/24/outline';
import { Button } from '@repo/components/ui/button';
import { AuthSessionResponse } from '@repo/shared/data/auth/session/types';
import { getUserRepoFunctionsNewUri } from '@repo/shared/lib/constants/repo';
import Link from 'next/link';

type CreateNewFunctionButtonProps = React.HTMLAttributes<HTMLDivElement> & {
  authSession?: AuthSessionResponse | null;
  ownerUsername: string;
  collectionSlug?: string;
}

export const CreateNewFunctionButton: React.FC<CreateNewFunctionButtonProps> = ( props ) => {
  const { authSession, ownerUsername, collectionSlug, ...divProps } = props;
  const isOwner = authSession?.user?.profile?.userName && authSession?.user?.profile?.userName === ownerUsername;

  let createNewFunctionHref = isOwner && getUserRepoFunctionsNewUri(ownerUsername);

  if ( createNewFunctionHref && collectionSlug ) {
    createNewFunctionHref += `?collectionSlug=${collectionSlug}`;
  }

  if ( !createNewFunctionHref ) {
    return null;
  }

  return (
    <div data-testid="create-new-function-button" { ...divProps }>
      <Button asChild variant='indigo' type='button' size='sm'>
        <Link href={ createNewFunctionHref }>
          <PlusIcon className="mr-2 h-4 w-4" /> Create Function
        </Link>
      </Button>
    </div>
  );
};
