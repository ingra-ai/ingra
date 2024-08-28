import { Skeleton } from "@repo/components/ui/skeleton";
import { cn } from "@repo/shared/lib/utils";

export default function FunctionFormLoading() {
  // You can add any UI inside Loading, including a Skeleton.
  const functionListGridClasses = cn({
    "grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6":
      true,
  });

  return (
    <div className="relative space-y-4" data-testid="function-list-loading">
      <Skeleton className="h-9 w-6/12 mb-4" />
      <Skeleton className="h-7 w-3/12" />
      <div className={functionListGridClasses}>
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
