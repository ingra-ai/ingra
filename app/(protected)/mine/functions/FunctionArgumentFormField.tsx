'use client';
import React from 'react';
import * as z from 'zod';
import { useFormContext, Controller } from 'react-hook-form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@components/ui/select';
import { TrashIcon } from '@heroicons/react/24/outline';
import { FUNCTION_ARGUMENT_ALLOWED_TYPES, FunctionArgumentSchema, FunctionSchema, MAX_FUNCTION_DESCRIPTION_LENGTH } from '@/schemas/function';
import { Switch } from "@/components/ui/switch"
import { cn } from '@lib/utils';
import FunctionArgumentInput from './FunctionArgumentInputSwitchField';
import { Textarea } from '@components/ui/textarea';
import { Input } from '@components/ui/input';

interface FunctionArgumentFormFieldProps {
  index: number;
  item: z.infer<typeof FunctionArgumentSchema>;
  remove: (idx: number) => void;
  className?: string;
}

const FunctionArgumentFormField: React.FC<FunctionArgumentFormFieldProps> = ({ index, item, remove, className }) => {
  const { register, setValue, watch, control, resetField, formState: { errors } } = useFormContext<z.infer<typeof FunctionSchema>>(); // useFormContext hook to access the form context
  const onTypeChanged = (value: string) => {
    setValue(`arguments.${index}.type`, value as any, { shouldValidate: true })

    let defaultValue = '';

    if ( value === 'number' ) {
      defaultValue = '0';
    }
    else if ( value === 'boolean' ) {
      defaultValue = 'false';
    }

    resetField(`arguments.${index}.defaultValue`, {
      defaultValue,
    });
  };

  return (
    <div key={( item.id || 'new' ) + index} data-testid={`argument-row-${index}`} className={cn("space-y-4", className)}>
      <div className="grid grid-cols-12 gap-4">
        <div className='col-span-7'>
          <Input
            {...register(`arguments.${index}.name`)}
            placeholder="Name"
            aria-autocomplete='none'
            autoComplete=""
            type="text"
          />
          {errors.arguments?.[index]?.name && <p className="text-xs font-medium text-destructive-foreground mt-3">{errors.arguments?.[index]?.name?.message}</p>}
        </div>
        <div className="col-span-4 items-end">
          <Controller
            control={control}
            name={`arguments.${index}.isRequired`}
            render={({ field: { onChange, value, ref } }) => (
              <div className="flex flex-row items-center space-x-3 space-y-0 px-2 py-2">
                <Switch
                  checked={ value }
                  onCheckedChange={ onChange }
                  ref={ ref }
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
          className="col-span-1 flex justify-end items-center text-destructive w-full"
        >
          <TrashIcon className="h-5 w-5" />
        </button>
      </div>
      <div className="grid grid-cols-12 gap-4">
        <div className='col-span-3'>
          <Select
            onValueChange={onTypeChanged}
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
        <Controller
          control={control}
          name={`arguments.${index}.defaultValue`}
          render={({ field }) => (
            <div className='col-span-9'>
              <FunctionArgumentInput
                id={`arguments.${index}.type`}
                type={ watch(`arguments.${index}.type`) as any }
                field={field as any}
              />
              {errors.arguments?.[index]?.defaultValue && <p className="text-xs font-medium text-destructive-foreground mt-3">{errors.arguments?.[index]?.defaultValue?.message}</p>}
            </div>
          )}
        />
      </div>
      <div className="grid grid-cols-12 mb-3">
        <Textarea
          {...register(`arguments.${index}.description`)}
          placeholder="Description"
          rows={3}
          className={`col-span-12 text-sm`}
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

export default FunctionArgumentFormField;
