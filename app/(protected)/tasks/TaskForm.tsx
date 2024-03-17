'use client';

import * as z from 'zod';
import { TaskSchema, TaskStatus, TaskPriority } from '@/schemas/task';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createTask } from '@app/(protected)/tasks/actions';
import { Button } from '@components/ui/button';
import { RefreshCcw } from 'lucide-react';
import { useCallback, useState } from 'react';
import { Logger } from '@lib/logger';
import { useToast } from '@components/ui/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@components/ui/select';

type TaskFormProps = {
  onSuccess?: () => void;
};

export const TaskForm: React.FC<TaskFormProps> = (props) => {
  const { onSuccess } = props;
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const { handleSubmit, register, formState, setValue, reset } = useForm<z.infer<typeof TaskSchema>>({
    resolver: zodResolver(TaskSchema),
    defaultValues: {
      title: '',
      description: '',
      status: TaskStatus.enum.TODO,
      priority: TaskPriority.enum.MEDIUM,
    },
  });

  const onSubmit = useCallback((values: z.infer<typeof TaskSchema>) => {
    setIsLoading(true);
    return createTask(values)
      .then((data) => {
        toast({
          title: 'Task created!',
          description: 'Task has been created successfully.',
        });

        reset();

        if (typeof onSuccess === 'function') {
          onSuccess();
        }
      })
      .catch((error: Error) => {
        toast({
          title: 'Uh oh! Something went wrong.',
          description: error?.message || 'Failed to perform task operation',
        });

        Logger.error(error?.message);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  return (
    <form className="block space-y-6 mt-10" method="POST" onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label htmlFor="title" className="block text-sm font-medium leading-6">
          Title
        </label>
        <input
          id="title"
          {...register('title')}
          placeholder="Enter a title"
          type="text"
          autoComplete="title"
          required
          autoFocus
          className="block w-full rounded-md border-0 bg-white/5 py-2 px-2 shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
        />
        {formState.errors.title && <p className="text-sm font-medium text-destructive-foreground mt-3 text-center">{formState.errors.title.message}</p>}
      </div>
      <div>
        <label htmlFor="description" className="block text-sm font-medium leading-6">
          Description
        </label>
        <textarea
          id="description"
          {...register('description')}
          placeholder="Enter a description"
          autoComplete=""
          required
          autoFocus
          className="block w-full rounded-md border-0 bg-white/5 py-2 px-2 shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
        />
        {formState.errors.description && <p className="text-sm font-medium text-destructive-foreground mt-3 text-center">{formState.errors.description.message}</p>}
      </div>
      <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
        <div className="sm:col-span-3">
          <div>
            <label className="block text-sm font-medium leading-6">Priority</label>
            <Select onValueChange={(value) => setValue('priority', TaskPriority.parse(value), { shouldValidate: true })} defaultValue={TaskPriority.enum.MEDIUM}>
              <SelectTrigger>
                <SelectValue placeholder="Select a priority" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(TaskPriority.enum).map(([key, value]) => (
                  <SelectItem key={key} value={key}>
                    {value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="sm:col-span-3">
          <div>
            <label className="block text-sm font-medium leading-6">Status</label>
            <Select onValueChange={(value) => setValue('status', TaskStatus.parse(value), { shouldValidate: true })} defaultValue={TaskStatus.enum.TODO}>
              <SelectTrigger>
                <SelectValue placeholder="Select a status" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(TaskStatus.enum).map(([key, value]) => (
                  <SelectItem key={key} value={key}>
                    {value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="grid py-8 grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
        <div className="sm:col-span-2"></div>
        <div className="sm:col-span-2"></div>
        <div className="sm:col-span-2">
          <Button variant={'default'} type="submit" disabled={isLoading} className="flex w-full justify-center rounded-md px-3 py-1.5 text-sm font-semibold leading-8 shadow-sm">
            {isLoading && <RefreshCcw className="animate-spin inline-block mr-2" />}
            {isLoading ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>
    </form>
  );
};
