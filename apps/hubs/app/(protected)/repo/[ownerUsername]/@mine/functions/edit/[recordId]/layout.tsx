import { Suspense, type PropsWithChildren, type ReactNode } from "react";
import FunctionEditSkeleton from "./loading";
import { Metadata } from "next";
import { APP_NAME } from "@repo/shared/lib/constants";

export const metadata: Metadata = {
  title: ["Edit Function", APP_NAME].join(" | "),
};

async function Layout({
  params,
  children,
}: {
  params: { ownerUsername: string; recordId: string };
  children: ReactNode;
}) {
  return <Suspense fallback={<FunctionEditSkeleton />}>{children}</Suspense>;
}

export default Layout;
