'use client';
import type { FC } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Button } from '../../../ui/button';
import { CircleDot, PlayCircleIcon, SortAscIcon } from 'lucide-react';
import { useCallback, useState } from 'react';
import { useToast } from '../../../ui/use-toast';
import { cn } from '@repo/shared/lib/utils';
import { TrashIcon } from '@heroicons/react/24/outline';
import FunctionArgumentInputSwitchField from './FunctionArgumentInputSwitchField';
import type { Prisma } from '@repo/db/prisma';
import type { MetricValues, UserSandboxOutput } from '@repo/shared/utils/vm/types';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../../../ui/collapsible';
import { USERS_API_FUNCTION_URI } from '@repo/shared/lib/constants';

type CodeSandboxFormProps = {
  isMarketplace?: boolean;
  ownerUsername?: string;
  functionRecord: Prisma.FunctionGetPayload<{
    include: {
      owner: {
        select: {
          profile: {
            select: {
              userName: true;
            };
          };
        };
      };
      arguments: true;
    };
  }>;
  onClose?: () => void;
};

type RunState = {
  isRunning: boolean;
  errors: UserSandboxOutput[];
  logs: UserSandboxOutput[];
  metrics: Partial<MetricValues>;
  output: any;
};

export const CodeSandboxForm: FC<CodeSandboxFormProps> = (props) => {
  const { isMarketplace = false, functionRecord, onClose = () => void 0 } = props;
  const { arguments: functionArguments = [] } = functionRecord;
  const { toast } = useToast();
  const [runState, setRunState] = useState<RunState>({
    isRunning: false,
    errors: [],
    logs: [],
    metrics: {},
    output: null,
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    reValidateMode: 'onSubmit',
    shouldUnregister: true,
    defaultValues: functionArguments.reduce(
      (acc, arg) => {
        acc[arg.name] = arg.defaultValue;
        return acc;
      },
      {} as Record<string, any>
    ),
  });

  const buildQueryString = (params: Record<string, any>) => {
    return Object.keys(params)
      .map((key) => encodeURIComponent(key) + '=' + encodeURIComponent(params[key]))
      .join('&');
  };

  const onRun = useCallback(
    async (values: Record<string, any>) => {
      setRunState({
        isRunning: true,
        errors: [],
        logs: [],
        metrics: {},
        output: null,
      });

      // execute code
      try {
        const ownerUsername = functionRecord.owner.profile?.userName;
        if (!ownerUsername) {
          throw new Error('Owner username is required to run the function');
        }

        let functionUrl = USERS_API_FUNCTION_URI.replace(':userName', ownerUsername).replace(':functionSlug', functionRecord.slug),
          options: RequestInit = {
            method: functionRecord.httpVerb,
            headers: {
              'Content-Type': 'application/json',
              SANDBOX_DEBUG: 'true',
            },
          };

        // For GET or DELETE, append parameters to the URL as query strings
        if (functionRecord.httpVerb === 'GET' || functionRecord.httpVerb === 'DELETE') {
          if (values && Object.keys(values).length > 0) {
            functionUrl += '?' + buildQueryString(values);
          }
        } else {
          // For POST, PUT, PATCH, use body for parameters
          options.body = JSON.stringify(values);
        }

        const fetchResult = await fetch(functionUrl, options)
          .then((res) => res.json())
          .catch((error) => {
            throw new Error(error);
          });

        if (!fetchResult) {
          throw new Error('Failed to fetch result');
        }

        const {
          data: { errors, metrics, logs, result },
        } = fetchResult;

        setRunState({
          isRunning: false,
          errors,
          logs,
          metrics,
          output: result,
        });
      } catch (error: any) {
        toast({
          variant: 'destructive',
          title: 'Code execution failed!',
          description: error?.message || 'Failed to execute function!',
        });

        setRunState({
          isRunning: false,
          errors: [],
          logs: [],
          metrics: {},
          output: null,
        });
      }
    },
    [functionRecord.slug, functionRecord.owner.profile?.userName, isMarketplace]
  );

  const onLogboxClose = useCallback(() => {
    setRunState({
      ...runState,
      output: null,
      errors: [],
      logs: [],
      metrics: {},
    });
  }, [runState]);

  const inputClasses = cn('block w-full rounded-md border-0 py-2 px-2 shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6');
  const metricsEntries = Object.entries(runState.metrics),
    hasOutput = !!runState.output || runState.errors.length > 0 || runState.logs.length > 0 || metricsEntries.length > 0;

  return (
    <form className="block space-y-6 mt-4 mb-20" method="POST" onSubmit={handleSubmit(onRun)}>
      <div className="block w-full rounded-md border shadow py-4">
        <Collapsible defaultOpen className="block">
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="flex w-full justify-between items-center">
              <p className="text-sm font-bold text-gray-900 dark:text-gray-100 leading-7">Arguments</p>
              <SortAscIcon className="h-4 w-4" />
              <span className="sr-only">Toggle</span>
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="p-4 space-y-4">
            {functionArguments.length ? (
              functionArguments.map((arg) => (
                <div key={arg.id} className="grid grid-cols-12 items-start">
                  <label htmlFor={arg.name} className="col-span-4 lg:col-span-3 text-sm font-medium text-right px-4 py-3">
                    {arg.isRequired ? '*' : ''}&nbsp;{arg.name}
                  </label>
                  <div className="col-span-8 lg:col-span-9">
                    <Controller
                      control={control}
                      name={arg.name}
                      rules={{ required: arg.isRequired }}
                      render={({ field }) => <FunctionArgumentInputSwitchField id={arg.name} type={arg.type as any} className={`${arg.type === 'boolean' ? '' : inputClasses}`} field={field as any} />}
                    />
                    {errors?.[arg.name] && typeof errors?.[arg.name]?.message === 'string' && <p className="text-xs font-medium text-destructive-foreground mt-3">{errors?.[arg.name]?.message?.toString()}</p>}
                    {arg.description && <p className="text-xs text-gray-500 pt-2">{arg.description}</p>}
                  </div>
                  <div className="col-span-2 lg:col-span-3"></div>
                </div>
              ))
            ) : (
              <div className="block">
                <p className="text-gray-700 dark:text-gray-300">No arguments required</p>
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>
      </div>

      {hasOutput && (
        <div className="block" data-testid="output">
          {/* Metrics Section */}
          <div className="block">
            <h2 className="text-lg font-semibold mb-1">Metric Outputs</h2>
            <div className="space-y-2 ml-2">
              {metricsEntries.length > 0 ? (
                metricsEntries.map(([metric, value], index) => (
                  <p key={index} className="text-xs font-medium">
                    {metric}: {value}
                  </p>
                ))
              ) : (
                <p className="text-xs text-gray-600 dark:text-gray-400">No metrics available</p>
              )}
            </div>
          </div>

          {/* Logbox Control (Close Button) */}
          <div id="logbox-control" className="w-full grid grid-cols-12 mb-2">
            <div className="col-span-6"></div>
            <div className="col-span-6 flex justify-end items-center">
              <button
                type="button"
                onClick={onLogboxClose} // Implement this function
                className="text-gray-600 dark:text-gray-400 hover:text-gray-200"
                aria-label="Close"
              >
                <TrashIcon className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Logs and Errors Section */}
          <div id="logbox" className="relative w-full min-h-[240px] max-h-[50vh] overflow-y-auto p-2 text-xs font-mono bg-card text-gray-900 dark:text-gray-100 rounded">
            <div className="overflow-wrap break-word" style={{ whiteSpace: 'pre-wrap' }}>
              {/* Logs */}
              {runState.logs.length > 0 &&
                runState.logs.map((log, idx) => (
                  <div key={`runState-log-${idx}`} className="text-gray-500">
                    <span className="text-gray-700 dark:text-gray-300">[log]:</span> {log.message}
                  </div>
                ))}

              {/* Errors */}
              {runState.errors.length > 0 &&
                runState.errors.map((error, idx) => (
                  <div key={`runState-error-${idx}`} className="text-red-500">
                    <span className="text-gray-700 dark:text-gray-300">[error]:</span> {error.message}
                  </div>
                ))}

              {/* Result Section */}
              {!!runState.output && (
                <div className="text-green-500">
                  <span className="text-gray-700 dark:text-gray-300">[output]:</span> {JSON.stringify(runState.output, null, 2)}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex w-full justify-end items-center space-x-4">
        <Button variant={'outline'} type="button" disabled={runState.isRunning} className="flex w-[120px] justify-center rounded-md px-3 py-1.5 text-sm font-semibold leading-8 shadow-sm" onClick={onClose}>
          Close
        </Button>
        <Button variant={'default'} type="submit" disabled={runState.isRunning} className="flex w-[160px] justify-center rounded-md px-3 py-1.5 text-sm font-semibold leading-8 shadow-sm">
          {runState.isRunning ? <CircleDot className="animate-spin inline-block mr-2" /> : <PlayCircleIcon className="inline-block mr-2" />}
          {runState.isRunning ? 'Running...' : 'Run'}
        </Button>
      </div>
    </form>
  );
};
