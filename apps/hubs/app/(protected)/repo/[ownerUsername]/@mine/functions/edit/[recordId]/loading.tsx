import { Skeleton } from "@repo/components/ui/skeleton";

export default function Loading() {
  // You can add any UI inside Loading, including a Skeleton.
  return (
    <div className="relative space-y-4" data-testid="function-form-loading">
      <Skeleton className="h-9 w-6/12 mb-4" />
      <Skeleton className="h-7 w-3/12" />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="block space-y-6 col-span-1 order-2 lg:order-1 md:col-span-6 xl:col-span-7 2xl:col-span-8">
          <Skeleton className="h-[70vh] w-full" />
        </div>
        <div className="block col-span-1 order-1 lg:order-2 lg:col-span-6 xl:col-span-5 2xl:col-span-4">
          <Skeleton className="h-[50vh] w-full" />
        </div>
      </div>
    </div>
  );
}
