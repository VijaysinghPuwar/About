import { motion } from 'framer-motion';
import { useMemo } from 'react';

interface Node {
  id: number;
  cx: number;
  cy: number;
  r: number;
  delay: number;
}

interface Edge {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export function CyberVisual() {
  const { nodes, edges } = useMemo(() => {
    const n: Node[] = [
      { id: 0, cx: 200, cy: 100, r: 6, delay: 0 },
      { id: 1, cx: 340, cy: 80, r: 4, delay: 0.5 },
      { id: 2, cx: 120, cy: 200, r: 5, delay: 1.0 },
      { id: 3, cx: 300, cy: 220, r: 7, delay: 0.3 },
      { id: 4, cx: 180, cy: 320, r: 4, delay: 0.8 },
      { id: 5, cx: 380, cy: 160, r: 5, delay: 1.2 },
      { id: 6, cx: 260, cy: 360, r: 6, delay: 0.6 },
      { id: 7, cx: 100, cy: 340, r: 3, delay: 1.5 },
      { id: 8, cx: 350, cy: 320, r: 5, delay: 0.2 },
      { id: 9, cx: 220, cy: 200, r: 8, delay: 0.4 },
      { id: 10, cx: 60, cy: 120, r: 3, delay: 1.1 },
      { id: 11, cx: 400, cy: 260, r: 4, delay: 0.9 },
    ];
    
    const e: Edge[] = [];
    const maxDist = 180;
    for (let i = 0; i < n.length; i++) {
      for (let j = i + 1; j < n.length; j++) {
        const dist = Math.hypot(n[i].cx - n[j].cx, n[i].cy - n[j].cy);
        if (dist < maxDist) {
          e.push({ x1: n[i].cx, y1: n[i].cy, x2: n[j].cx, y2: n[j].cy });
        }
      }
    }
    return { nodes: n, edges: e };
  }, []);

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Glow backdrop */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-primary/[0.06] blur-[100px] pointer-events-none" />
      <div className="absolute top-1/3 left-1/3 w-[250px] h-[250px] rounded-full bg-secondary/[0.04] blur-[80px] pointer-events-none" />

      <svg viewBox="0 0 460 440" className="w-full max-w-[460px] h-auto">
        <defs>
          <linearGradient id="edge-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(195, 100%, 50%)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="hsl(263, 70%, 58%)" stopOpacity="0.15" />
          </linearGradient>
          <linearGradient id="node-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(195, 100%, 50%)" />
            <stop offset="100%" stopColor="hsl(263, 70%, 58%)" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Edges */}
        {edges.map((edge, i) => (
          <motion.line
            key={`e-${i}`}
            x1={edge.x1} y1={edge.y1}
            x2={edge.x2} y2={edge.y2}
            stroke="url(#edge-grad)"
            strokeWidth="1"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 4, repeat: Infinity, delay: i * 0.2, ease: 'easeInOut' }}
          />
        ))}

        {/* Nodes */}
        {nodes.map((node) => (
          <motion.g key={node.id} filter="url(#glow)">
            <motion.circle
              cx={node.cx}
              cy={node.cy}
              r={node.r}
              fill="url(#node-grad)"
              initial={{ opacity: 0.4, scale: 1 }}
              animate={{
                opacity: [0.4, 1, 0.4],
                y: [0, -6, 0],
              }}
              transition={{
                duration: 3 + node.delay,
                repeat: Infinity,
                delay: node.delay,
                ease: 'easeInOut',
              }}
            />
            {/* Outer ring on larger nodes */}
            {node.r >= 6 && (
              <motion.circle
                cx={node.cx}
                cy={node.cy}
                r={node.r + 6}
                fill="none"
                stroke="url(#node-grad)"
                strokeWidth="0.5"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.4, 0] }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  delay: node.delay + 0.5,
                  ease: 'easeInOut',
                }}
              />
            )}
          </motion.g>
        ))}
      </svg>
    </div>
  );
}
