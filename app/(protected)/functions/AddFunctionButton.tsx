'use client';

import { FormSlideOver } from '@components/slideovers/FormSlideOver';
import { FunctionForm } from './FunctionForm';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { CodeXml } from 'lucide-react';
import { CodeEditorForm } from './CodeEditorForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export const AddFunctionButton: React.FC = () => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  function onSuccess() {
    setOpen(false);
    startTransition(() => {
      // Refresh the current route and fetch new data from the server without
      // losing client-side browser or React state.
      router.refresh();
    });
  }

  return (
    <div className="flex items-center justify-center">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="relative inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-secondary-foreground bg-secondary hover:bg-secondary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary-hover"
      >
        New&nbsp;<CodeXml aria-label='code' />
      </button>
      <FormSlideOver title="New Function" open={open} setOpen={setOpen}>
        <Tabs defaultValue="function-tab" className="">
          <TabsList>
            <TabsTrigger value="function-tab">Function</TabsTrigger>
            <TabsTrigger value="metadata-tab">Metadata</TabsTrigger>
          </TabsList>
          <TabsContent value="function-tab">
            {/* <FunctionForm onSuccess={onSuccess} /> */}
            <CodeEditorForm onSuccess={onSuccess} />
          </TabsContent>
          <TabsContent value="metadata-tab">
            Metadata
          </TabsContent>
        </Tabs>
      </FormSlideOver>
    </div>
  );
};
