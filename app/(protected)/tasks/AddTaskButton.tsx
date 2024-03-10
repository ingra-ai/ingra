"use client";

import { FormSlideOver } from "@components/slideovers/FormSlideOver";
import { TaskForm } from "./TaskForm";
import { useState, useTransition } from "react";
import { useRouter } from 'next/navigation';

export const AddTaskButton: React.FC = () => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  function onSuccess () {
    setOpen( false );
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
        New Task
      </button>
      <FormSlideOver title="New Task" open={open} setOpen={setOpen}>
        <TaskForm onSuccess={onSuccess} />
      </FormSlideOver>
    </div>
  );
}