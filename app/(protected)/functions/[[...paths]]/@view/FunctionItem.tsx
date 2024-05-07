'use client';
import React from 'react';
import { PencilIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';
import { type Function } from '@prisma/client';
import formatDistance from 'date-fns/formatDistance';

interface FunctionProps {
  functionData: Function;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const FunctionItem: React.FC<FunctionProps> = (props) => {
  const { functionData, onView, onEdit, onDelete } = props;
  return (
    <div className="bg-gray-800 text-white shadow-md rounded-lg p-4 mb-4 flex justify-between items-center">
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-gray-100">{functionData.slug}</h2>
        <p className="text-sm text-gray-500">Updated: { formatDistance(functionData.updatedAt, Date.now(), { addSuffix: true }) }</p>
        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${functionData.isPrivate ? 'bg-red-700 text-red-200' : 'bg-green-700 text-green-200'}`}>
          {functionData.isPrivate ? 'Private' : 'Public'}
        </span>
      </div>
      <div className="flex items-center">
        <button onClick={onView} aria-label='View' title='View' className="p-1 mr-2 text-blue-300 hover:text-blue-400">
          <EyeIcon className="h-6 w-6" />
        </button>
        <button onClick={onEdit} aria-label='Edit' title='Edit' className="p-1 mr-2 text-green-300 hover:text-green-400">
          <PencilIcon className="h-6 w-6" />
        </button>
        <button onClick={onDelete} aria-label='Delete' title='Delete' className="p-1 text-red-300 hover:text-red-400">
          <TrashIcon className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
};

export default FunctionItem;
