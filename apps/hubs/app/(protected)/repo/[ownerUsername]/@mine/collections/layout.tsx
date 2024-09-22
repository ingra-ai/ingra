import type { ReactNode } from 'react';

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
