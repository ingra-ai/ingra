import { Skeleton } from "@components/ui/skeleton";

export default function Loading() {
  // You can add any UI inside Loading, including a Skeleton.
  return (
    <div className="relative space-y-4" data-testid="collection-view-loading">
      <div className="mb-4">
        <Skeleton className="h-9 w-6/12 mb-4" />
        <Skeleton className="h-7 w-3/12" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-12">
        <div className="col-span-1 md:col-span-1 xl:col-span-4">
          <Skeleton className="h-[70vh] w-full" />
        </div>
        <div className="col-span-1 md:col-span-2 xl:col-span-8">
          <Skeleton className="h-[70vh] w-full" />
        </div>
      </div>
    </div>
  );
}