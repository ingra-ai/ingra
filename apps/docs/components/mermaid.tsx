'use client';
import mermaid from 'mermaid';
import React, { useEffect, useRef } from 'react';

mermaid.initialize({ startOnLoad: true });

export const Mermaid = (props: any) => {
  const { chart } = props;
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) {
      mermaid.contentLoaded();
    }
  }, [chart]);

  return (
    <div className="mermaid dark:bg-zinc-200 p-4 rounded-lg" ref={ref}>
      {chart}
    </div>
  );
};

export default Mermaid;
