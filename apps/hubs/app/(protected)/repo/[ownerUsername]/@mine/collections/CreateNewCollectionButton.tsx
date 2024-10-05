'use client';
import React, { useState } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import { CollectionForm } from '@repo/components/data/collections/mine/CollectionForm';
import { FormSlideOver } from '@repo/components/slideovers/FormSlideOver';
import { Button } from '@repo/components/ui/button';

type CreateNewCollectionButtonProps = React.HTMLAttributes<HTMLDivElement>;

const CreateNewCollectionButton: React.FC<CreateNewCollectionButtonProps> = ( props ) => {
  const [open, setOpen] = useState(false);

  const handleCancel = () => {
    setOpen(false);
  };

  return (
    <div data-testid="create-new-collection-button" { ...props }>
      <Button variant="indigo" size={'xs'} onClick={ () => setOpen(true) }>
        <PlusIcon className="h-5 w-5 mr-2" aria-hidden="true" />
        Create New Collection
      </Button>
      <FormSlideOver title={'Add new collection'} open={open} setOpen={setOpen}>
        <CollectionForm onCancel={handleCancel} />
      </FormSlideOver>
    </div>
  );
};

export default CreateNewCollectionButton;