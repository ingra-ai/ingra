import { Skeleton } from "@components/ui/skeleton";

export default function Loading() {
  // You can add any UI inside Loading, including a Skeleton.
  return (
    <div className="container mx-auto space-y-4">
      <Skeleton className="h-6 w-1/2" />
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
        <Skeleton className="h-36" />
        <Skeleton className="h-36" />
        <Skeleton className="h-36" />
      </div>
      <div className="">
        <Skeleton className="h-32 w-full" />
      </div>
    </div>
  );
}