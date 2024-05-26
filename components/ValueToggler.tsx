import { type PropsWithChildren, useState, FC } from "react";
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { Button } from "@components/ui/button";

export type ValueTogglerProps = {};

export const ValueToggler: FC<PropsWithChildren<ValueTogglerProps>> = (props) => {
  const [reveal, setReveal] = useState(false);
  return (
    <div data-testid="value-toggler" className="flex items-center justify-between w-full">
      {
        reveal ? (
          <span className="text-sm truncate">{props.children}</span>
        ) : (
          <span className="text-sm">******</span>
        )
      }
      <Button type='button' onClick={() => setReveal(!reveal)} size="icon" variant="ghost" className="ml-2 min-w-[40px]">
        {
          reveal ? <EyeIcon className="w-5 h-5" /> : <EyeSlashIcon className="w-5 h-5" />
        }
      </Button>
    </div>
  );

};