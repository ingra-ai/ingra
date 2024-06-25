'use client';
import type { FC } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Button } from '@components/ui/button';
import { CircleDot, PlayCircleIcon, SortAscIcon, SortDescIcon } from 'lucide-react';
import { useCallback, useState } from 'react';
import { useToast } from '@components/ui/use-toast';
import { runCodeSandbox } from '@actions/runCodeSandbox';
import { cn } from '@lib/utils';
import { TrashIcon } from '@heroicons/react/24/outline';
import FunctionArgumentInputSwitchField from '@protected/mine/functions/FunctionArgumentInputSwitchField';
import type { Prisma } from '@prisma/client';
import type { MetricSandboxOutput, SandboxOutput, UserSandboxOutput } from '@app/api/utils/vm/types';
import { ScrollArea } from '@components/ui/scroll-area';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

type CodeSandboxFormProps = {
  isMarketplace?: boolean;
  functionRecord: Prisma.FunctionGetPayload<{
    include: {
      arguments: true
    }
  }>;
  onClose?: () => void;
};

type RunState = {
  isRunning: boolean;
  outputs: SandboxOutput[];
  result: any;
};

export const CodeSandboxForm: FC<CodeSandboxFormProps> = (props) => {
  const {
    isMarketplace = false,
    functionRecord,
    onClose = () => void 0
  } = props;
  const { arguments: functionArguments = [] } = functionRecord;
  const { toast } = useToast();
  const [runState, setRunState] = useState<RunState>({
    isRunning: false,
    outputs: [],
    result: null,
  });

  const { control, handleSubmit, formState: { errors } } = useForm({
    reValidateMode: 'onSubmit',
    shouldUnregister: true,
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
      const { outputs, result } = await runCodeSandbox(functionRecord.id, values, isMarketplace);
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
        description: error?.message || 'Failed to execute function!',
      });

      setRunState({
        isRunning: false,
        outputs: [],
        result: null,
      });
    }
  }, [functionRecord.id, isMarketplace]);

  const onLogboxClose = useCallback(() => {
    setRunState({
      ...runState,
      outputs: [],
    });
  }, [runState]);

  const inputClasses = cn('block w-full rounded-md border-0 bg-white/5 py-2 px-2 shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6');

  const userOutputs: UserSandboxOutput[] = runState.outputs.filter(output => ['log', 'error', 'output'].indexOf(output.type) >= 0) as UserSandboxOutput[];
  const metricOutputs: MetricSandboxOutput[] = runState.outputs.filter(output => ['metric'].indexOf(output.type) >= 0) as MetricSandboxOutput[];

  return (
    <form className="block space-y-6 mt-4 mb-20" method="POST" onSubmit={handleSubmit(onRun)}>
      <div className="block w-full rounded-md border shadow py-4 bg-black/10">
        <Collapsible defaultOpen className='block'>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="flex w-full justify-between items-center">
              <p className="text-sm font-bold text-gray-100 leading-7">Arguments</p>
              <SortAscIcon className="h-4 w-4" />
              <span className="sr-only">Toggle</span>
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className='p-4 space-y-4'>
            {functionArguments.length ? functionArguments.map((arg) => (
              <div key={arg.id} className="grid grid-cols-12 items-start">
                <label htmlFor={arg.name} className="col-span-4 lg:col-span-3 text-sm font-medium text-right px-4 py-3">
                  {arg.isRequired ? '*' : ''}&nbsp;{arg.name}
                </label>
                <div className='col-span-8 lg:col-span-9'>
                  <Controller
                    control={control}
                    name={arg.name}
                    rules={{ required: arg.isRequired }}
                    render={({ field }) => (
                      <FunctionArgumentInputSwitchField
                        id={arg.name}
                        type={arg.type as any}
                        className={`${arg.type === 'boolean' ? '' : inputClasses}`}
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
            )) : (
              <div className="block">
                <p className="text-gray-300">No arguments required</p>
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>
      </div>
      <div className="block">
        {
          userOutputs.length > 0 && (
            <>
              <div className="block">
                <h2 className="text-lg font-semibold mb-1">Metric Outputs</h2>
                <div className="space-y-2 ml-2">
                  {metricOutputs.map((metric, index) => (
                    <p key={index} className="text-xs font-medium">{metric.metric}: {metric.value}</p>
                  ))}
                </div>
              </div>
              <div id="logbox-control" className="w-full grid grid-cols-12 mb-2">
                <div className="col-span-6"></div>
                <div className="col-span-6 flex justify-end items-center">
                  <button
                    onClick={onLogboxClose} // You will implement this function to handle closing
                    className="text-gray-400 hover:text-gray-200"
                    aria-label="Close"
                  >
                    <TrashIcon className="h-6 w-6" />
                  </button>
                </div>
              </div>
              <div id="logbox" className="relative w-full min-h-[240px] max-h-[50vh] overflow-y-auto p-2 text-xs font-mono bg-gray-800 text-gray-100 rounded">

                <div
                  className="overflow-wrap break-word"
                  style={{ whiteSpace: 'pre-wrap' }}
                >
                  {
                    userOutputs.map((output, idx) => {
                      const spanClasses = cn({
                        'text-gray-500': output.type === 'log',
                        'text-red-500': output.type === 'error',
                        'text-green-500': output.type === 'output'
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
            </>
          )
        }
      </div>
      <div className="flex w-full justify-end items-center space-x-4">
        <Button variant={'outline'} type="button" disabled={runState.isRunning} className="flex w-[120px] justify-center rounded-md px-3 py-1.5 text-sm font-semibold leading-8 shadow-sm" onClick={onClose}>
          Close
        </Button>
        <Button variant={'default'} type="submit" disabled={runState.isRunning} className="flex w-[160px] justify-center rounded-md px-3 py-1.5 text-sm font-semibold leading-8 shadow-sm">
          {
            runState.isRunning ?
              <CircleDot className="animate-spin inline-block mr-2" /> :
              <PlayCircleIcon className="inline-block mr-2" />
          }
          {runState.isRunning ? 'Running...' : 'Run'}
        </Button>
      </div>
    </form>
  );
};
