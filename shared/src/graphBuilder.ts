import type { AtlasGraphDTO, AtlasNode, AtlasEdge } from './types';

export interface OpenAlexWork { id: string; title: string; cited_by_count?: number; abstract?: string; topics?: { id: string; display_name: string; score?: number }[]; authorships?: { author: { id: string; display_name: string }; institutions?: { id: string; display_name: string }[] }[]; referenced_works?: string[]; }

export function buildHeterogeneousGraph(works: OpenAlexWork[]): AtlasGraphDTO {
  const nodes = new Map<string, AtlasNode>();
  const edges = new Map<string, AtlasEdge>();
  const addNode = (node: AtlasNode) => { if (!nodes.has(node.id)) nodes.set(node.id, node); };
  const addEdge = (edge: AtlasEdge) => { if (!edges.has(edge.id)) edges.set(edge.id, edge); };

  works.forEach((w) => {
    addNode({ id: w.id, label: w.title, type: 'work', score: 1 + Math.log10((w.cited_by_count ?? 1) + 1), metadata: { abstract: w.abstract, citedBy: w.cited_by_count ?? 0 } });
    (w.topics ?? []).slice(0, 5).forEach((t) => {
      addNode({ id: t.id, label: t.display_name, type: 'topic', score: 0.8 + (t.score ?? 0.2) });
      addEdge({ id: `${w.id}->${t.id}:topic`, source: w.id, target: t.id, type: 'topic', weight: t.score ?? 0.4 });
    });
    (w.authorships ?? []).slice(0, 8).forEach((a) => {
      addNode({ id: a.author.id, label: a.author.display_name, type: 'author', score: 1.2 });
      addEdge({ id: `${w.id}->${a.author.id}:authorship`, source: w.id, target: a.author.id, type: 'authorship', weight: 1 });
      (a.institutions ?? []).slice(0, 2).forEach((inst) => {
        addNode({ id: inst.id, label: inst.display_name, type: 'institution', score: 1 });
        addEdge({ id: `${a.author.id}->${inst.id}:affiliation`, source: a.author.id, target: inst.id, type: 'affiliation', weight: 0.9 });
      });
    });
    (w.referenced_works ?? []).slice(0, 8).forEach((ref) => addEdge({ id: `${w.id}->${ref}:citation`, source: w.id, target: ref, type: 'citation', weight: 0.5 }));
  });

  const boundedNodes = Array.from(nodes.values()).sort((a, b) => b.score - a.score).slice(0, 400);
  const keep = new Set(boundedNodes.map((n) => n.id));
  const boundedEdges = Array.from(edges.values()).filter((e) => keep.has(e.source) && keep.has(e.target));
  return { nodes: boundedNodes, edges: boundedEdges };
}
