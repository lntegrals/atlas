import Graph from 'graphology';
import louvain from 'graphology-communities-louvain';
import type { AtlasGraphDTO } from './types';

export function assignCommunities(graphDto: AtlasGraphDTO): Map<string, number> {
  const g = new Graph({ type: 'undirected' });
  graphDto.nodes.forEach((n) => g.addNode(n.id));
  graphDto.edges.forEach((e) => {
    if (g.hasNode(e.source) && g.hasNode(e.target) && !g.hasEdge(e.source, e.target)) g.addEdge(e.source, e.target, { weight: e.weight });
  });
  const result = louvain(g, { getEdgeWeight: 'weight' }) as Record<string, number>;
  return new Map(Object.entries(result));
}

export function buildClusterSummaries(graphDto: AtlasGraphDTO, communities: Map<string, number>) {
  const grouped = new Map<number, string[]>();
  communities.forEach((community, nodeId) => {
    if (!grouped.has(community)) grouped.set(community, []);
    grouped.get(community)!.push(nodeId);
  });
  return Array.from(grouped.entries()).map(([community, ids]) => {
    const nodes = graphDto.nodes.filter((n) => ids.includes(n.id));
    const works = nodes.filter((n) => n.type === 'work').slice(0, 3).map((n) => n.label);
    const authors = nodes.filter((n) => n.type === 'author').slice(0, 2).map((n) => n.label);
    const topics = nodes.filter((n) => n.type === 'topic').slice(0, 3).map((n) => n.label);
    return {
      community,
      title: topics[0] ?? `Cluster ${community}`,
      summary: `This cluster connects ${works.length} anchor works with ${authors.length} key authors around ${topics.join(', ') || 'mixed themes'}.`,
      works,
      authors
    };
  });
}
