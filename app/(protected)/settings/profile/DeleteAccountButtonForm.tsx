'use client';
import { Button } from '@components/ui/button';
import React, { startTransition, useCallback, useState } from 'react';
import { destroyProfile } from '../actions/profile';
import { RefreshCcw } from 'lucide-react';
import { toast } from '@components/ui/use-toast';
import { useRouter } from 'next/navigation';

interface DeleteAccountButtonFormProps {
}

export const DeleteAccountButtonForm: React.FC<DeleteAccountButtonFormProps> = () => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleDeleteAccount = useCallback(() => {

    if ( typeof window !== 'undefined' && confirm('Are you sure you want to delete your account and all related data?') ) {
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
    }
  }, []);

  return (
    <Button type='button' disabled={ isLoading } variant={'destructive'} onClick={handleDeleteAccount} >
      {isLoading  && <RefreshCcw className="animate-spin inline-block mr-2" />}
      Yes, delete my account
    </Button>
  );
};
