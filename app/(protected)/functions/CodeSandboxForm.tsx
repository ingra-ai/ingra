'use client';

import { useForm, Controller } from 'react-hook-form';
import { Button } from '@components/ui/button';
import { Bug, CircleDot } from 'lucide-react';
import { useCallback, useState } from 'react';
import { useToast } from '@components/ui/use-toast';
import { SandboxOutput, runCodeSandbox } from './actions/vm';
import { cn } from '@lib/utils';
import { XMarkIcon } from '@heroicons/react/24/outline';
import FunctionArgumentInputSwitchField from '@protected/functions/FunctionArgumentInputSwitchField';
import { Prisma } from '@prisma/client';

type CodeSandboxFormProps = {
  functionRecord: Prisma.FunctionGetPayload<{
    include: {
      arguments: true
    }
  }>;
};

type RunState = {
  isRunning: boolean;
  outputs: SandboxOutput[];
  result: any;
};

export const CodeSandboxForm: React.FC<CodeSandboxFormProps> = (props) => {
  const { functionRecord } = props;
  const { arguments: functionArguments = [] } = functionRecord;
  const { toast } = useToast();
  const [runState, setRunState] = useState<RunState>({
    isRunning: false,
    outputs: [],
    result: null,
  });

  const { control, handleSubmit, formState: { errors } } = useForm({
    reValidateMode: 'onSubmit',
    defaultValues: functionArguments.reduce((acc, arg) => {
      acc[arg.name] = arg.defaultValue;
      return acc;
    }, {} as Record<string, any>),
  });

  const onRun = useCallback(async (values: any) => {
    setRunState({
      isRunning: true,
      outputs: [],
      result: null,
    });

    // execute code
    try {
      const { outputs, result } = await runCodeSandbox(functionRecord.id, values)
      setRunState({
        isRunning: false,
        outputs,
        result,
      });
    }
    catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Code execution failed!',
        description: error?.message || 'Failed to update function!',
      });

      setRunState({
        isRunning: false,
        outputs: [],
        result: null,
      });
    }
  }, [functionRecord.id]);

  const onLogboxClose = useCallback(() => {
    setRunState({
      ...runState,
      outputs: [],
    });
  }, [runState]);

  const inputClasses = cn('block w-full rounded-md border-0 bg-white/5 py-2 px-2 shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6');

  return (
    <form className="block space-y-6 mt-4 mb-20" method="POST" onSubmit={handleSubmit(onRun)}>
      <div className="block w-full rounded-md border p-4 shadow space-y-4 bg-black/10">
        <div className="block">
          <h4 className="text-sm font-bold text-gray-100 leading-7">Arguments</h4>
        </div>
        {functionArguments.map((arg) => (
          <div key={arg.id} className="grid grid-cols-12 items-start">
            <label htmlFor={arg.name} className="col-span-3 lg:col-span-2 text-sm font-medium text-right px-4 py-3">
              {arg.isRequired ? '*' : ''}&nbsp;{arg.name}
            </label>
            <div className='col-span-7 lg:col-span-7'>
              <Controller
                control={control}
                name={arg.name}
                rules={{ required: arg.isRequired }}
                render={({ field }) => (
                  <FunctionArgumentInputSwitchField
                    id={arg.name}
                    type={ arg.type as any }
                    className={`${ arg.type === 'boolean' ? '' : inputClasses}`}
                    field={field as any}
                  />
                )}
              />
              {errors?.[arg.name] && typeof errors?.[arg.name]?.message === 'string' && (
                <p className="text-xs font-medium text-destructive-foreground mt-3">
                  {errors?.[arg.name]?.message?.toString()}
                </p>
              )}
              {arg.description && (
                <p className="text-xs text-gray-500 pt-2">{arg.description}</p>
              )}
            </div>
            <div className='col-span-2 lg:col-span-3'>
            </div>
          </div>
        ))}
      </div>
      <div>
        {
          runState.outputs.length > 0 && (
            <div id="logbox" className="relative w-full max-h-[240px] overflow-y-auto p-2 text-xs font-mono bg-gray-800 text-gray-100 rounded">
              <button
                onClick={onLogboxClose} // You will implement this function to handle closing
                className="absolute top-1 right-1 text-gray-400 hover:text-gray-200"
                aria-label="Close"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
              <div
                className="overflow-wrap break-word"
                style={{ whiteSpace: 'pre-wrap' }}
              >
                {
                  runState.outputs.map((output, idx) => {
                    const spanClasses = cn({
                      'text-gray-500': output.type === 'log',
                      'text-red-500': output.type === 'error',
                      'text-green-500': output.type === 'output',
                    });
                    return (
                      <div key={`runState-output-${idx}`}>
                        <span className="text-gray-300">[{output.type}]:</span> <span className={spanClasses}>{output.message}</span>
                      </div>
                    );
                  })
                }
              </div>
            </div>
          )
        }
      </div>
      <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
        <div className="sm:col-span-4"></div>
        <div className="sm:col-span-2 flex justify-end">
          <Button variant={'outline'} type="submit" disabled={runState.isRunning} className="flex w-full justify-center rounded-md px-3 py-1.5 text-sm font-semibold leading-8 shadow-sm">
            {
              runState.isRunning ?
                <CircleDot className="animate-spin inline-block mr-2" /> :
                <Bug className="inline-block mr-2" />
            }
            {runState.isRunning ? 'Running...' : 'Run'}
          </Button>
        </div>
      </div>
    </form>
  );
};
