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
  Node,
  Edge,
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  BackgroundVariant,
} from '@xyflow/react';
import dynamic from 'next/dynamic';
import { useTheme } from 'next-themes';
import React, { useCallback } from 'react';

import { edgeTypes } from './EdgeTypes';
import useLayout from './hooks/useLayout';
import nodeTypes from './NodeTypes';

/**
 * Dynamic import of ReactFlow, Controls, MiniMap, and Background components from `@xyflow/react`.
 * Since these components are not SSR compatible, we use dynamic imports to ensure that `useTheme` from `next-themes` works correctly in a Next.js environment.
 */
const ReactFlow = dynamic(
  async () => (await import("@xyflow/react")).ReactFlow,
  { ssr: false }
);

const Background = dynamic(
  async () => (await import("@xyflow/react")).Background,
  { ssr: false }
);

const defaultNodes: Node[] = [
  {
    id: '1',
    data: { label: '🌮 Taco' },
    position: { x: 0, y: 0 },
    type: 'workflow',
  },
  {
    id: '2',
    data: { label: '+' },
    position: { x: 0, y: 150 },
    type: 'placeholder',
  },
];

// initial setup: connect the workflow node to the placeholder node with a placeholder edge
const defaultEdges: Edge[] = [
  {
    id: '1=>2',
    source: '1',
    target: '2',
    type: 'placeholder',
  },
];

type FlowProps = {
  // theme?: 'light' | 'dark';
};

const Flow: React.FC<FlowProps> = (props) => {
  // const { theme = 'light' } = props;
  const { theme } = useTheme();
  const [nodes, setNodes, onNodesChange] = useNodesState(defaultNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(defaultEdges);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  // this hook call ensures that the layout is re-calculated every time the graph changes
  useLayout();

  return (
    <div className="w-full h-full">
      <ReactFlow
        colorMode={theme as 'light' | 'dark'}
        
        defaultNodes={defaultNodes}
        defaultEdges={defaultEdges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        // nodes={nodes}
        // edges={edges}

        minZoom={0.2}
        nodesDraggable={true}
        nodesConnectable={false}
        zoomOnDoubleClick={false}
        proOptions={{
          hideAttribution: true,
        }}

        fitView
        // @ts-ignore
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
      >
        {/* <Controls /> */}
        {/* <MiniMap /> */}
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
      </ReactFlow>
    </div>
  );
};

const FlowWrapper: React.FC<FlowProps> = (props) => {
  return (
    <ReactFlowProvider>
      <Flow {...props} />
    </ReactFlowProvider>
  );
};

export default FlowWrapper;