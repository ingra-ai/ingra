import { cn } from '@/lib/utils';
import clsx from 'clsx';
import { PropsWithChildren } from 'react';

type NoteProps = PropsWithChildren & {
  title?: string;
  type?: 'note' | 'danger' | 'info' | 'warning' | 'success';
};

export default function Note({ children, title = 'Note', type = 'note' }: NoteProps) {
  const noteClassNames = clsx({
    'dark:bg-neutral-900 bg-neutral-100': type == 'note',
    'dark:bg-red-950 bg-red-100 border-red-200 dark:border-red-900': type === 'danger',
    'bg-warning text-warning-foreground': type === 'warning',
    'bg-info text-info-foreground': type === 'info',
    'dark:bg-green-950 bg-green-100 border-green-200 dark:border-green-900': type === 'success',
  });

  return (
    <div className={cn('border rounded-md py-0.5 px-3.5 text-sm tracking-wide', noteClassNames)}>
      <p className="font-semibold -mb-3">{title}:</p> {children}
    </div>
  );
}
