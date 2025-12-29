'use client';

import { X } from 'lucide-react';
import { useState } from 'react';

export function DeprecationBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="relative bg-amber-100 dark:bg-amber-900/50 border-b border-amber-200 dark:border-amber-800 px-6 py-4 text-center text-amber-800 dark:text-amber-200">
      <p className="text-lg font-semibold">
        Ingra has been discontinued
      </p>
      <p className="text-sm mt-1">
        This documentation is preserved for reference.
      </p>
      <button
        onClick={() => setDismissed(true)}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-amber-200 dark:hover:bg-amber-800 rounded"
        aria-label="Dismiss banner"
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  );
}
