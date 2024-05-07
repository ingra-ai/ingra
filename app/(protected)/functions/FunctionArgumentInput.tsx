'use client';
import React from 'react';
import * as z from 'zod';
import { useFormContext, Controller } from 'react-hook-form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@components/ui/select';
import { TrashIcon } from '@heroicons/react/24/outline';
import { FUNCTION_ARGUMENT_ALLOWED_TYPES, FunctionArgumentSchema, FunctionSchema, MAX_FUNCTION_DESCRIPTION_LENGTH } from '@/schemas/function';
import { Switch } from "@/components/ui/switch"
import { cn } from '@lib/utils';

interface FunctionArgumentInputProps {
  index: number;
  item: z.infer<typeof FunctionArgumentSchema>;
  remove: (idx: number) => void;
  className?: string;
}

const FunctionArgumentInput: React.FC<FunctionArgumentInputProps> = ({ index, item, remove, className }) => {
  const { register, setValue, watch, control, formState: { errors } } = useFormContext<z.infer<typeof FunctionSchema>>(); // useFormContext hook to access the form context
  const inputClasses = cn('block w-full rounded-md border-0 bg-white/5 py-2 px-2 shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6');

  return (
    <div key={( item.id || 'new' ) + index} data-testid={`argument-row-${index}`} className={cn("space-y-4", className)}>
      <div className="grid grid-cols-12 gap-4">
        <div className='col-span-8'>
          <input
            {...register(`arguments.${index}.name`)}
            placeholder="Name"
            className={inputClasses}
          />
          {errors.arguments?.[index]?.name && <p className="text-xs font-medium text-destructive-foreground mt-3">{errors.arguments?.[index]?.name?.message}</p>}
        </div>
        <div className="col-span-3 items-end">
          <Controller
            control={control}
            name={`arguments.${index}.isRequired`}
            render={({ field: { onChange, value, ref } }) => (
              <div className="flex flex-row items-center space-x-3 space-y-0 px-2 py-2">
                <Switch
                  checked={ value }
                  onCheckedChange={ onChange }
                  id={`arguments.${index}.isRequired`}
                />
                <label htmlFor={`arguments.${index}.isRequired`} className="block text-sm font-medium">
                  Required
                </label>
              </div>
            )}
          />
        </div>
        <button
          type="button"
          onClick={() => remove(index)}
          className="col-span-1 flex justify-end items-center text-red-500 w-full"
        >
          <TrashIcon className="h-5 w-5" />
        </button>
      </div>
      <div className="grid grid-cols-12 gap-4">
        <div className='col-span-3'>
          <Select
            onValueChange={(value) => setValue(`arguments.${index}.type`, value as any, { shouldValidate: true })}
            defaultValue={item.type || 'string'}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {FUNCTION_ARGUMENT_ALLOWED_TYPES.map((value, idx) => (
                <SelectItem key={`func-arg-${idx}`} value={value}>
                  {value.charAt(0).toUpperCase() + value.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <input
          {...register(`arguments.${index}.defaultValue`)}
          placeholder="Default Value"
          className={`col-span-9 ${inputClasses}`}
        />
      </div>
      <div className="grid grid-cols-12 mb-3">
        <textarea
          {...register(`arguments.${index}.description`)}
          placeholder="Description"
          rows={3}
          className={`col-span-12 text-sm ${inputClasses}`}
        />
        <div className='col-span-12 grid grid-cols-12 mt-3'>
          <div className='col-span-8 text-left'>
            {errors.arguments?.[index]?.description && <p className="text-xs font-medium text-destructive-foreground">{errors.arguments?.[index]?.description?.message}</p>}
          </div>
          <div className='col-span-4 text-right'>
            <p className="text-xs text-muted-foreground">{`${watch(`arguments.${index}.description`)?.length || 0}/${MAX_FUNCTION_DESCRIPTION_LENGTH} characters`}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FunctionArgumentInput;
