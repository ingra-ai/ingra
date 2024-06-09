import { Skeleton } from "@components/ui/skeleton";
import { cn } from "@lib/utils";

export default function Loading() {
  // You can add any UI inside Loading, including a Skeleton.
  const gridClasses = cn({
    'grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3': true
  });
  
  return (
    <div className="relative space-y-4" data-testid="marketplace-list-loading">
      <Skeleton className="h-9 w-6/12 mb-4" />
      <Skeleton className="h-7 w-3/12" />
      <div className={ gridClasses }>
        <Skeleton className="h-[230px] w-full" />
        <Skeleton className="h-[230px] w-full" />
        <Skeleton className="h-[230px] w-full" />
        <Skeleton className="h-[230px] w-full" />
        <Skeleton className="h-[230px] w-full" />
        <Skeleton className="h-[230px] w-full" />
      </div>
    </div>
  );
}