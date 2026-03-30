import ELK from 'elkjs/lib/elk.bundled.js';
import type { AtlasGraphDTO } from './types';

const elk = new ELK();

export async function buildStoryLayout(graph: AtlasGraphDTO, focusId: string) {
  const neighbors = graph.nodes.filter((n) => n.id === focusId || graph.edges.some((e) => (e.source === focusId && e.target === n.id) || (e.target === focusId && e.source === n.id))).slice(0, 40);
  const keep = new Set(neighbors.map((n) => n.id));
  const edges = graph.edges.filter((e) => keep.has(e.source) && keep.has(e.target));

  const layout = await elk.layout({
    id: 'root',
    layoutOptions: { 'elk.algorithm': 'layered', 'elk.direction': 'RIGHT' },
    children: neighbors.map((n) => ({ id: n.id, width: 150, height: 56 })),
    edges: edges.map((e, i) => ({ id: `e${i}`, sources: [e.source], targets: [e.target] }))
  });

  const positions = new Map<string, { x: number; y: number }>();
  (layout.children ?? []).forEach((node) => positions.set(node.id, { x: node.x ?? 0, y: node.y ?? 0 }));
  return { positions };
}
