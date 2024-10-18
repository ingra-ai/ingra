'use client';
import { Button } from '@repo/components/ui/button';
// import { destroyProfile } from '@repo/shared/actions/profile';
import { RefreshCcw } from 'lucide-react';
// import { toast } from '@repo/components/ui/use-toast';
import { useRouter } from 'next/navigation';
import React, { startTransition, useCallback, useState } from 'react';

interface DeleteAccountButtonFormProps {}

export const DeleteAccountButtonForm: React.FC<DeleteAccountButtonFormProps> = () => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleDeleteAccount = useCallback(() => {
    if (typeof window !== 'undefined' && confirm('Are you sure you want to delete your account and all related data?')) {
      /**
       * @todo Disable for now
       * Future plan is to send a confirmation email before deleting the account, and give user the option to export their data or cancel the deletion.
       */
      alert('This feature is disabled for now. Please contact support for assistance.');

      /*
      setIsLoading(true);

      return destroyProfile()
        .then((result) => {
          if ( result.status !== 'ok' ) {
            throw new Error(result.message);
          }
  
          toast({
            title: 'Account deleted!',
            description: 'Your account has been deleted successfully.',
          });
  
          startTransition(() => {
            router.push('/auth/logout');
          });
        })
        .catch((error: Error) => {
          toast({
            title: 'Uh oh! Something went wrong.',
            description: error?.message || 'Failed to delete account!',
          });
        })
        .finally(() => {
          setIsLoading(false);
        });
      */
    }
  }, []);

  return (
    <Button type="button" disabled={isLoading} variant={'destructive'} onClick={handleDeleteAccount}>
      {isLoading && <RefreshCcw className="animate-spin inline-block mr-2" />}
      Yes, delete my account
    </Button>
  );
};
