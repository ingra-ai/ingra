import { Suspense, type ReactNode } from "react";
import CollectionViewSkeleton from "./loading";

async function Layout({
  params,
  children,
}: {
  params: { ownerUsername: string; recordId: string };
  children: ReactNode;
}) {
  return <Suspense fallback={<CollectionViewSkeleton />}>{children}</Suspense>;
}

export default Layout;
