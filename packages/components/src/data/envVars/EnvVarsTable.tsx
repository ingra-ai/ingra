'use client';

import type { FC } from 'react';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../../ui/alert-dialog';
import { formatDistance } from 'date-fns';
import { Button } from '../../ui/button';
import { EnvVarsOptionalPayload } from '../../data/envVars/types';
import { cn } from '@repo/shared/lib/utils';
import { ValueToggler } from '../../ValueToggler';

type EnvVarsTableProps = {
  envVars: EnvVarsOptionalPayload[];
  onCreate: () => void;
  onEdit: (record: EnvVarsOptionalPayload) => void;
  onDelete: (record: EnvVarsOptionalPayload) => void;
};

export const EnvVarsTable: FC<EnvVarsTableProps> = (props) => {
  const { envVars, onCreate, onEdit, onDelete } = props;
  const withoutDateColumns = envVars.every((envVar) => envVar.createdAt === undefined || envVar.updatedAt === undefined);

  return (
    <div className="block max-w-[1600px]" data-testid="env-vars-table">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold leading-6">Environment Variables ({envVars.length})</h1>
          <p className="mt-2 text-sm">
            Your environment variables will be passed as part of <code className="text-orange-500 italic font-semibold">ctx</code> in your functions
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <Button type="button" variant="accent" onClick={onCreate}>
            Add Environment Variable
          </Button>
        </div>
      </div>
      <table className="mt-4 w-full whitespace-nowrap text-left table-fixed">
        <colgroup>
          <col
            className={cn({
              'w-3/12': !withoutDateColumns,
              'w-4/12': withoutDateColumns,
            })}
          />
          <col
            className={cn({
              'w-4/12': !withoutDateColumns,
              'w-7/12': withoutDateColumns,
            })}
          />
          {!withoutDateColumns && (
            <>
              <col className="w-2/12" />
              <col className="w-2/12" />
            </>
          )}
          <col className={cn('w-1/12')} />
        </colgroup>
        <thead className="border-b border-white/10 text-sm leading-6">
          <tr>
            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold sm:pl-0">
              Key
            </th>
            <th scope="col" className="pl-3 py-3.5 text-left text-sm font-semibold w-full">
              Value
            </th>
            {!withoutDateColumns && (
              <>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold truncate">
                  Created At
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold truncate">
                  Updated At
                </th>
              </>
            )}
            <th scope="col" className="relative py-3.5 pr-4 sm:pr-0">
              <span className="sr-only">Edit</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {envVars.map((envVar) => {
            return (
              <tr key={envVar.id}>
                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium sm:pl-0 truncate" title={envVar.key}>
                  <code className="text-orange-500 italic font-semibold">{envVar.key}</code>
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm">
                  <ValueToggler>{envVar.value}</ValueToggler>
                </td>
                {!withoutDateColumns && (
                  <>
                    <td className="whitespace-nowrap px-3 py-4 text-sm truncate">
                      {envVar?.createdAt
                        ? formatDistance(envVar.createdAt, Date.now(), {
                            addSuffix: true,
                          })
                        : false}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm truncate">
                      {envVar?.updatedAt
                        ? formatDistance(envVar.updatedAt, Date.now(), {
                            addSuffix: true,
                          })
                        : false}
                    </td>
                  </>
                )}
                <td className="relative whitespace-nowrap py-4 pr-4 text-right text-sm font-medium sm:pr-0">
                  <button onClick={() => onEdit(envVar)} aria-label="Edit" title="Edit" className="p-1 mr-2 text-zinc-300 hover:text-zinc-400">
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button aria-label="Delete" title="Delete" className="p-1 text-destructive hover:text-destructive/80">
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure to delete &quot;{envVar.key}&quot;?</AlertDialogTitle>
                        <AlertDialogDescription>This action cannot be undone. This will permanently delete your environment variable.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => onDelete(envVar)}>Continue</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
