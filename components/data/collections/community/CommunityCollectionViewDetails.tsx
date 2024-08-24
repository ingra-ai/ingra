'use client';
import React from 'react';
import { CommunityCollectionViewDetailPayload } from '@components/data/collections/community/types';

interface CommunityCollectionViewDetailsProps {
  record: CommunityCollectionViewDetailPayload;
}

const CommunityCollectionViewDetails: React.FC<CommunityCollectionViewDetailsProps> = ({ record }) => {
  return (
    <div className="block" data-testid="community-collection-view-details">
      <div className="flex justify-between items-center">
        <div className="flex-1">
          <h2 className="text-2xl font-semibold inline">{record.name}</h2>
        </div>
        <div className="flex-0 px-4">
        </div>
      </div>
      <p className="text-sm mb-6 text-gray-300">
        Slug: <span className="text-info">{record.slug}</span>
      </p>
      <div className="mt-2">
        <h3 className="text-sm font-semibold leading-6">Description</h3>
        <div
          className="py-2 rounded-sm min-h-[50vh] text-sm whitespace-pre-wrap"
          dangerouslySetInnerHTML={{ __html: record.description || '' }}
        />
      </div>
    </div>
  );
};

export default CommunityCollectionViewDetails;
