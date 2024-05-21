'use client';

import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import type { EnvVars } from '@prisma/client';
import { format, formatDistance } from 'date-fns';
import { Button } from '@components/ui/button';

type EnvVarsTableProps = {
  envVars: EnvVars[];
  onCreate: () => void;
  onEdit: (record: EnvVars) => void;
  onDelete: (record: EnvVars) => void;
};

export const EnvVarsTable: React.FC<EnvVarsTableProps> = (props) => {
  const { envVars, onCreate, onEdit, onDelete } = props;

  return (
    <div className="block max-w-[1600px]" data-testid='env-vars-table'>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold leading-6">Environment Variables ({ envVars.length })</h1>
          <p className="mt-2 text-sm">
            Your environment variables will be passed as part of <code className="italic">userVars</code> in your functions and flows
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <Button onClick={onCreate}>
            Add Environment Variable
          </Button>
        </div>
      </div>
      <table className="mt-4 w-full whitespace-nowrap text-left table-fixed">
        <colgroup>
          <col className="w-3/12" />
          <col className="w-4/12" />
          <col className="w-2/12" />
          <col className="w-2/12" />
          <col className="w-1/12" />
        </colgroup>
        <thead className="border-b border-white/10 text-sm leading-6">
          <tr>
            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold sm:pl-0">
              Key
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold w-full">
              Value
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold">
              Created At
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold">
              Updated At
            </th>
            <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-0">
              <span className="sr-only">Edit</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {envVars.map((envVar) => (
            <tr key={envVar.id}>
              <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium sm:pl-0">
                {envVar.key}
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm truncate">{envVar.value}</td>
              <td className="whitespace-nowrap px-3 py-4 text-sm">{formatDistance(envVar.createdAt, Date.now(), { addSuffix: true })}</td>
              <td className="whitespace-nowrap px-3 py-4 text-sm">{formatDistance(envVar.updatedAt, Date.now(), { addSuffix: true })}</td>
              <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                <button onClick={() => onEdit(envVar)} aria-label='Edit' title='Edit' className="p-1 mr-2 text-zinc-300 hover:text-zinc-400">
                  <PencilIcon className="h-4 w-4" />
                </button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button aria-label='Delete' title='Delete' className="p-1 text-red-300 hover:text-red-400">
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure to delete &quot;{envVar.key}&quot;?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your environment variable.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => onDelete(envVar)}>Continue</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
