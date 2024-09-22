'use client';
import React from 'react';
import { CommunityCollectionViewDetailPayload } from './types';
import { getUserApiCollectionsOpenApiJsonUri } from '@repo/shared/lib/constants/repo';

interface CommunityCollectionViewDetailsProps {
  record: CommunityCollectionViewDetailPayload;
}

const CommunityCollectionViewDetails: React.FC<CommunityCollectionViewDetailsProps> = ({ record }) => {
  const openApiJsonUrl = getUserApiCollectionsOpenApiJsonUri(record.owner.profile.userName || '', record.slug);

  return (
    <div className="block" data-testid="community-collection-view-details">
      <div className="flex justify-between items-center">
        <div className="flex-1">
          <h2 className="text-2xl font-semibold inline">{record.name}</h2>
        </div>
        <div className="flex-0 px-4"></div>
      </div>
      <div className="flex flex-col text-sm text-gray-300 mb-6 gap-2">
        <p className="">
          <span className="font-medium">Slug: </span>
          <code className="ml-2">{record.slug}</code>
        </p>
        <p className="">
          <span className="font-medium">OpenAPI: </span>
          <a href={ openApiJsonUrl } target="_blank">
            <span className="text-info">openapi.json</span>
          </a>
        </p>
      </div>
      <div className="mt-2">
        <h3 className="text-sm font-semibold leading-6">Description</h3>
        <div className="py-2 rounded-sm min-h-[50vh] text-sm whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: record.description || '' }} />
      </div>
    </div>
  );
};

export default CommunityCollectionViewDetails;
