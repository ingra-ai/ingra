import type { ReactNode } from 'react';

async function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="relative" data-testid="collections-layout">
      {children}
    </div>
  );
}

export default Layout;