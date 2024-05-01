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
import Editor, { type OnMount } from '@monaco-editor/react';
import { FunctionSchema } from '@/schemas/function';
import { upsertFunction } from './actions/functions';

const CODE_DEFAULT_TEMPLATE = `
async function handler(ctx) {
  const { envVars, ...args } = ctx;
  console.log({ envVars, args });

  // Add your code here
  return 'hello world';
}
`;

type CodeEditorFormProps = {
  onSuccess?: () => void;
};

export const CodeEditorForm: React.FC<CodeEditorFormProps> = (props) => {
  const { onSuccess } = props;
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null);
  const { toast } = useToast();
  const [isRunning, setIsRunning] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const { handleSubmit, register, formState, setValue, reset } = useForm<z.infer<typeof FunctionSchema>>({
    resolver: zodResolver(FunctionSchema),
    defaultValues: {
      slug: 'hello-world',
      code: CODE_DEFAULT_TEMPLATE,
    },
  });

  const onEditorMount = useCallback<OnMount>((editor, monaco) => {
    editorRef.current = editor;
  }, []);

  const onSave = useCallback(async (values: z.infer<typeof FunctionSchema>) => {
    setIsSaving(true);
  
    // save to db and return function
    const savedFunction = await upsertFunction(values)
      .then((resp) => {
        toast({
          title: 'Function updated!',
          description: 'Function has been updated successfully.',
        });
        return resp.data;
      })
      .catch((error: Error) => {
        toast({
          title: 'Uh oh! Something went wrong.',
          description: error?.message || 'Failed to update function!',
        });

        Logger.error(error?.message);
      })
      .finally(() => {
        setIsSaving(false);
      });

    return savedFunction;
  }, []);

  const onRun = useCallback(() => {
    setIsRunning(true);


    console.log('Running code:', editorRef.current);
  }, []);

  return (
    <form className="block space-y-6 mt-5" method="POST" onSubmit={handleSubmit(onSave)}>
      <div>
        <label htmlFor="slug" className="block text-sm font-medium leading-6">
          Slug
        </label>
        <input
          id="slug"
          {...register('slug')}
          placeholder="hello-world"
          autoComplete="function-code-slug"
          type="text"
          required
          autoFocus
          className="block w-full rounded-md border-0 bg-white/5 py-2 px-2 shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
        />
        {formState.errors.slug && <p className="text-sm font-medium text-destructive-foreground mt-3">{formState.errors.slug.message}</p>}
      </div>
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
        <div className="sm:col-span-2">
          <Button variant={'outline'} type="button" onClick={onRun} disabled={isRunning} className="flex w-full justify-center rounded-md px-3 py-1.5 text-sm font-semibold leading-8 shadow-sm">
            {
              isRunning ? 
                <CircleDot className="animate-spin inline-block mr-2" /> : 
                <Bug className="inline-block mr-2" />
              }
            {isRunning ? 'Running...' : 'Run'}
          </Button>
        </div>
        <div className="sm:col-span-2">
          <Button variant={'default'} type="submit" disabled={isSaving || isRunning} className="flex w-full justify-center rounded-md px-3 py-1.5 text-sm font-semibold leading-8 shadow-sm">
            {isSaving && <RefreshCcw className="animate-spin inline-block mr-2" />}
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>
    </form>
  );
};
