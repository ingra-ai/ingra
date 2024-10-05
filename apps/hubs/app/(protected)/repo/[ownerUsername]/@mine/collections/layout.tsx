import type { ReactNode } from 'react';

type FunctionLayoutProps = {
  children: ReactNode;
};

export default function Layout(props: FunctionLayoutProps) {
  const { children } = props;

  return (
    <div className="relative" data-testid="collections-layout">
      {children}
    </div>
  );
}
