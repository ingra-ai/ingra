'use client';
import React from 'react';
import { FunctionItem, FunctionItemNew } from './FunctionItem';
import { type Function } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { useToast } from '@components/ui/use-toast';
import { deleteFunction } from '@protected/functions/actions/functions';

interface FunctionsListProps {
  functions: Function[];
}

const FunctionsList: React.FC<FunctionsListProps> = ({ functions }) => {
  const router = useRouter();
  const { toast } = useToast();

  const handleEdit = (id: string) => {
    router.push(`/functions/edit/${id}`);
  };

  const handleDelete = (id: string) => {
    deleteFunction(id).then(() => {
      toast({
        title: 'Success!',
        description: 'Function has been deleted successfully.',
      });
      router.replace(`/functions`);
      router.refresh();
    }).catch((error) => {
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: error?.message || 'Failed to delete function!',
      });
    });
  };

  return (
    <>
      <FunctionItemNew />
      {functions.map(func => (
        <FunctionItem
          key={func.id}
          functionData={func}
          onEdit={() => handleEdit(func.id)}
          onDelete={() => handleDelete(func.id)}
        />
      ))}
    </>
  );
};

export default FunctionsList;
