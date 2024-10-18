import { Leftbar } from '@repo/components/navs/leftbar';

import DocsMenu from '@/components/docs-menu';

export default function DocsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex items-start gap-14">
      <Leftbar key="leftbar">
        <DocsMenu />
      </Leftbar>
      <div className="flex-[4]">{children}</div>{' '}
    </div>
  );
}
