import { getBezierPath, EdgeProps } from '@xyflow/react';

import styles from './EdgeTypes.module.css';

// the placeholder edges do not have a special functionality, only used as a visual
export default function PlaceholderEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style,
  markerEnd,
}: EdgeProps) {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <path
      id={id}
      style={style}
      className={styles.placeholderPath}
      d={edgePath}
      markerEnd={markerEnd}
    />
  );
}
