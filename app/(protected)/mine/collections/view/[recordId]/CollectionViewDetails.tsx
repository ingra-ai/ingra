'use client';
import React from 'react';
import { PencilIcon, EyeIcon } from '@heroicons/react/24/outline';
import { CollectionViewDetailPayload } from './types';
import { FormSlideOver } from '@components/slideovers/FormSlideOver';
import { CollectionForm } from '@protected/mine/collections/CollectionForm';

interface CollectionViewDetailsProps {
  record: CollectionViewDetailPayload;
}

const CollectionViewDetails: React.FC<CollectionViewDetailsProps> = ({ record }) => {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="block" data-testid="collection-view-details">
      <div className="flex justify-between items-center">
        <div className="flex-1">
          <h2 className="text-2xl font-semibold inline">{record.name}</h2>
        </div>
        <div className="flex-0 px-4">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex items-center px-3 py-2 rounded-sm hover:bg-indigo-500"
          >
            <PencilIcon className="w-4 h-4 mr-2" />
            Edit
          </button>
        </div>
      </div>
      <p className="text-sm mb-6 text-gray-300">
        Slug: <span className="text-info">{record.slug}</span>
      </p>
      <div className="mt-2">
        <h3 className="text-sm font-semibold leading-6">Description</h3>
        <div
          className="py-2 rounded-sm min-h-[50vh] text-sm"
          dangerouslySetInnerHTML={{ __html: record.description || '' }}
        />
      </div>
      <FormSlideOver title={ `Edit collection '${ record.name}'` } open={open} setOpen={setOpen}>
        <CollectionForm collectionRecord={ record } onCancel={ () => setOpen(false) } />
      </FormSlideOver>
    </div>
  );
};

export default CollectionViewDetails;
