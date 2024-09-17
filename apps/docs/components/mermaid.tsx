'use client';
import dynamic from 'next/dynamic.js';
import type { MermaidProps } from 'mdx-mermaid/Mermaid';

const MdxMermaid = dynamic(() => import('mdx-mermaid/Mermaid').then((res) => res.Mermaid), { ssr: false });

// Workaround for https://github.com/vercel/next.js/discussions/36369
// Inspired by https://github.com/datopian/datahub/blob/8feb87739ddaeb07272666d4c11d50774a583e57/packages/core/src/ui/Mermaid/Mermaid.tsx#L12
export const Mermaid: React.FC<MermaidProps> = ({ ...props }) => {
  return (
    <div className="dark:bg-zinc-200 p-4 rounded-lg">
      <MdxMermaid {...props} />
    </div>
  );
};
