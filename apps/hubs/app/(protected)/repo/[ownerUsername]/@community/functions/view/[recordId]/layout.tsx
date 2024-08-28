import { Suspense, type ReactNode } from "react";
import MarketplaceViewFunctionSkeleton from "./loading";

async function Layout({
  params,
  children,
}: {
  params: { ownerUsername: string; recordId: string };
  children: ReactNode;
}) {
  return (
    <Suspense fallback={<MarketplaceViewFunctionSkeleton />}>
      {children}
    </Suspense>
  );
}

export default Layout;
