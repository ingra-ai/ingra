import { Skeleton } from "@components/ui/skeleton";

export default function Loading() {
  // You can add any UI inside Loading, including a Skeleton.
  return (
    <div className="block container" data-testid="assistants-page">
      <div className="max-w-prose mx-auto">
        <Skeleton className="h-6 w-1/2 mb-8" />
        <Skeleton className="h-[85vh] w-full" />
      </div>
    </div>
  );
}