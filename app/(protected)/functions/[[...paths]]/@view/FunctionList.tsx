'use client';
import React from 'react';
import FunctionItem from './FunctionItem';
import { type Function } from '@prisma/client';
import { useRouter } from 'next/navigation';

interface FunctionsListProps {
  functions: Function[];
}

const FunctionsList: React.FC<FunctionsListProps> = ({ functions }) => {
  const router = useRouter();

  const handleView = (id: string) => {
    console.log('View function', id);
    // Implementation needed here
  };

  const handleEdit = (id: string) => {
    router.push(`/functions/edit/${id}`);
  };

  const handleDelete = (id: string) => {
    console.log('Delete function', id);
    // Implementation needed here
  };

  return (
    <div className="container mx-auto p-4">
      {functions.map(func => (
        <FunctionItem
          key={func.id}
          functionData={func}
          onView={() => handleView(func.id)}
          onEdit={() => handleEdit(func.id)}
          onDelete={() => handleDelete(func.id)}
        />
      ))}
    </div>
  );
};

export default FunctionsList;
