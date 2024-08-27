import type { ReactNode } from "react";
import { APP_NAME } from "@repo/shared/lib/constants";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: ["My Collections", APP_NAME].join(" | "),
};

type FunctionLayoutProps = {
  children: ReactNode;
};

export default function Layout(props: FunctionLayoutProps) {
  const { children } = props;

  return (
    <div className="block px-4" data-testid="collections-layout">
      {children}
    </div>
  );
}
