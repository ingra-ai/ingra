'use client';

import { FUNCTION_ARGUMENT_ALLOWED_TYPES } from "@/schemas/function";
import type { ControllerRenderProps } from "react-hook-form";
import { Switch } from "@/components/ui/switch"
import { cn } from "@lib/utils";
import { Input } from "@components/ui/input";

type FunctionArgumentInputSwitchFieldProps = {
  type: typeof FUNCTION_ARGUMENT_ALLOWED_TYPES[number];
  id?: string;
  className?: string;
  placeholder?: string;
  field: ControllerRenderProps<any>;
};

const FunctionArgumentInputSwitchField: React.FC<FunctionArgumentInputSwitchFieldProps> = (props) => {
  const { type, id, className, placeholder, field } = props;
  const classes = cn(className);

  switch (type) {
    case 'string':
      return (
        <Input type='text' { ...field } className={ classes } id={ id } placeholder={ placeholder } />
      );
    case 'number':
      return (
        <Input type='number' { ...field } className={ classes } id={ id } placeholder={ placeholder } />
      );
    case 'boolean':
      return (
        <div className={`flex flex-row items-center space-x-3 space-y-0 px-2 py-2 ${ classes }`}>
          <Switch
            checked={ field.value === 'true' }
            onCheckedChange={ (value) => field.onChange(value.toString()) }
            ref={ field.ref }
            id={ id }
          />
          <label htmlFor={ id } className="block text-sm font-medium">
            { field.value === 'true' ? 'True' : 'False' }
          </label>
        </div>
      );
    default:
      return null;
  }
};

export default FunctionArgumentInputSwitchField;
