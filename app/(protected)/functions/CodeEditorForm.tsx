'use client';

import * as z from 'zod';
import { TaskSchema, TaskStatus, TaskPriority } from '@/schemas/task';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createTask } from '@app/(protected)/tasks/actions';
import { Button } from '@components/ui/button';
import { RefreshCcw, Bug, CircleDot } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import { Logger } from '@lib/logger';
import { useToast } from '@components/ui/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@components/ui/select';
import Editor from '@monaco-editor/react';

const CODE_DEFAULT_TEMPLATE = `
async function handler(ctx) {
  const { envVars, ...args } = ctx;
  console.log({ envVars, args });

  // Add your code here
}
`;

type CodeEditorFormProps = {
  onSuccess?: () => void;
};

export const CodeEditorForm: React.FC<CodeEditorFormProps> = (props) => {
  const { onSuccess } = props;
  const editorRef = useRef(null);
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

  const onEditorMount = useCallback((editor: any, monaco: any) => {
    editorRef.current = editor;
  }, []);

  const handleRun = useCallback(() => {
    const code = editorRef.current;
    console.log('Running code:', editorRef.current);
  }, []);

  return (
    <form className="block space-y-6 mt-5" method="POST" onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label htmlFor="description" className="block text-sm font-medium leading-6">
          Code &#40;Node.js&#41;
        </label>
        <Editor 
          height="40vh" 
          defaultLanguage="javascript" 
          theme='vs-dark'
          keepCurrentModel={false}
          options={{
            lineNumbers: 'off',
            minimap: { enabled: false },
          }}
          defaultValue={CODE_DEFAULT_TEMPLATE}
          onMount={onEditorMount}
        />
      </div>
      <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
        <div className="sm:col-span-2"></div>
        <div className="sm:col-span-2"></div>
        <div className="sm:col-span-2">
          <Button variant={'outline'} type="button" onClick={handleRun} disabled={isLoading} className="flex w-full justify-center rounded-md px-3 py-1.5 text-sm font-semibold leading-8 shadow-sm">
            {
              isLoading ? 
                <CircleDot className="animate-spin inline-block mr-2" /> : 
                <Bug className="inline-block mr-2" />
              }
            {isLoading ? 'Running...' : 'Run'}
          </Button>
        </div>
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

      <div className="grid py-8 grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
        <div className="sm:col-span-2"></div>
        <div className="sm:col-span-2">

        <Button variant={'default'} type="button" disabled={isLoading} className="flex w-full justify-center rounded-md px-3 py-1.5 text-sm font-semibold leading-8 shadow-sm">
            {isLoading && <RefreshCcw className="animate-spin inline-block mr-2" />}
            {isLoading ? 'Testing...' : 'Test'}
          </Button>
        </div>
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
