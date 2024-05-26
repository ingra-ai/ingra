import type { ReactNode } from 'react';

type FunctionLayoutProps = {
  children: ReactNode;
};

export default function Layout(props: FunctionLayoutProps) {
  const {
    children
  } = props;

  return (
    <div className="block px-4 mb-20" data-testid='flows-layout'>
      { children }
    </div>
  );
}