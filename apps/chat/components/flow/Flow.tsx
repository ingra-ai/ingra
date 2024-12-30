/**
 * Flow component renders a React Flow diagram with nodes and edges.
 * 
 * This component uses dynamic imports for `ReactFlow`, `Controls`, `MiniMap`, and `Background`
 * from `@xyflow/react` to ensure that `useTheme` from `next-themes` works correctly in a Next.js environment.
 * 
 * @component
 * @example
 * return (
 *   <Flow />
 * )
 * 
 * @typedef {Object} FlowProps
 * @property {string} [theme] - Optional theme property, can be 'light' or 'dark'.
 * 
 * @param {FlowProps} props - The properties object.
 * @returns {React.FC<FlowProps>} The Flow component.
 */
'use client';
import {
  // ReactFlow,
  // MiniMap,
  // Controls,
  // Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  BackgroundVariant,
} from '@xyflow/react';
import dynamic from 'next/dynamic';
import { useTheme } from 'next-themes';
import React, { useCallback } from 'react';

/**
 * Dynamic import of ReactFlow, Controls, MiniMap, and Background components from `@xyflow/react`.
 * Since these components are not SSR compatible, we use dynamic imports to ensure that `useTheme` from `next-themes` works correctly in a Next.js environment.
 */
const ReactFlow = dynamic(
  async () => (await import("@xyflow/react")).ReactFlow,
  { ssr: false }
);

const Controls = dynamic(
  async () => (await import("@xyflow/react")).Controls,
  { ssr: false }
);

const MiniMap = dynamic(
  async () => (await import("@xyflow/react")).MiniMap,
  { ssr: false }
);

const Background = dynamic(
  async () => (await import("@xyflow/react")).Background,
  { ssr: false }
);

const initialNodes = [
  { id: '1', position: { x: 0, y: 0 }, data: { label: '1' } },
  { id: '2', position: { x: 0, y: 100 }, data: { label: '2' } },
];

const initialEdges = [{ id: 'e1-2', source: '1', target: '2' }];

type FlowProps = {
  // theme?: 'light' | 'dark';
};

const Flow: React.FC<FlowProps> = (props) => {
  // const { theme = 'light' } = props;
  const { theme } = useTheme();
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  return (
    <div className="w-full h-full">
      <ReactFlow
        colorMode={theme as 'light' | 'dark'}
        nodes={nodes}
        edges={edges}
        fitView
        // @ts-ignore
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
      >
        <Controls />
        {/* <MiniMap /> */}
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
      </ReactFlow>
    </div>
  );
};

export default Flow;