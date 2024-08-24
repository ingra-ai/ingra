'use client';

import type { FC } from 'react';
import { EnvVarForm } from './EnvVarsForm';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { EnvVarsTable } from './EnvVarsTable';
import { deleteEnvVar } from '@actions/envVars';
import { useToast } from '@components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { EnvVarsOptionalPayload } from './types';

type EnvVarsSectionProps = {
  envVars: EnvVarsOptionalPayload[];
};

export const EnvVarsSection: FC<EnvVarsSectionProps> = (props) => {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [record, setRecord] = useState<EnvVarsOptionalPayload | null>(null);

  function onFormSuccess() {
    setOpen(false);
    setRecord(null);
    startTransition(() => {
      // Refresh the current route and fetch new data from the server without
      // losing client-side browser or React state.
      router.refresh();
    });
  }

  function onCreate() {
    setRecord(null);
    setOpen(true);
  }

  function onEdit(record: EnvVarsOptionalPayload) {
    setRecord(record);
    setOpen(true);
  }

  function onDelete(record: EnvVarsOptionalPayload) {
    deleteEnvVar(record.id).then((result) => {
      if ( result.status !== 'ok' ) {
        throw new Error(result.message);
      }

      toast({
        title: 'Success!',
        description: 'Environment variable has been deleted successfully.',
      });
      
      startTransition(() => {
        // Refresh the current route and fetch new data from the server without
        // losing client-side browser or React state.
        router.refresh();
      });
    }).catch((error) => {
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: error?.message || 'Failed to delete environment variable!',
      });
    });
  }

  return (
    <section className="block" data-testid="env-vars-section">
      <EnvVarsTable envVars={props.envVars} onCreate={onCreate} onEdit={onEdit} onDelete={onDelete} />
      {/* <FormSlideOver title="" open={open} setOpen={setOpen}>
      </FormSlideOver> */}
      <Dialog open={ open } onOpenChange={ setOpen }>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              { 
                record ? 'Edit Environment Variable' : 'Add Environment Variable'
              }
            </DialogTitle>
            <DialogDescription>
              {
                record ? 'Edit an existing environment variable.' : 'Add a new environment variable.'
              }
            </DialogDescription>
          </DialogHeader>
          <EnvVarForm className='mt-5' onSuccess={onFormSuccess} envVarRecord={ record || undefined } />
        </DialogContent>
      </Dialog>
    </section>
  );
};