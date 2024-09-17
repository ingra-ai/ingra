declare module 'mdx-mermaid';
declare module 'mdx-mermaid/Mermaid' {
  export type MermaidProps = {
    chart: string;
    className?: string;
  };
  export const Mermaid: React.FC<MermaidProps>;
}
