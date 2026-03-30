import Graph from 'graphology';
import louvain from 'graphology-communities-louvain';
import type { AtlasGraphDTO } from './types';

export interface ClusterSummary {
  community: number;
  title: string;
  summary: string;
  works: string[];
  authors: string[];
}

export function assignCommunities(graphDto: AtlasGraphDTO): Map<string, number> {
  const g = new Graph({ type: 'undirected' });
  graphDto.nodes.forEach((node) => g.addNode(node.id));
  graphDto.edges.forEach((edge) => {
    if (g.hasNode(edge.source) && g.hasNode(edge.target) && !g.hasEdge(edge.source, edge.target)) {
      g.addEdge(edge.source, edge.target, { weight: edge.weight });
    }
  });
  const result = louvain(g, { getEdgeWeight: 'weight' }) as Record<string, number>;
  return new Map(Object.entries(result));
}

export function buildClusterSummaries(graphDto: AtlasGraphDTO, communities: Map<string, number>): ClusterSummary[] {
  const grouped = new Map<number, string[]>();
  communities.forEach((community, nodeId) => {
    if (!grouped.has(community)) grouped.set(community, []);
    grouped.get(community)!.push(nodeId);
  });

  return Array.from(grouped.entries()).map(([community, ids]) => {
    const nodes = graphDto.nodes.filter((node) => ids.includes(node.id));
    const works = nodes.filter((node) => node.type === 'work').slice(0, 3).map((node) => node.label);
    const authors = nodes.filter((node) => node.type === 'author').slice(0, 2).map((node) => node.label);
    const topics = nodes.filter((node) => node.type === 'topic').slice(0, 3).map((node) => node.label);

    return {
      community,
      title: topics[0] ?? `Cluster ${community}`,
      summary: `This cluster connects ${works.length} anchor works with ${authors.length} key authors around ${topics.join(', ') || 'mixed themes'}.`,
      works,
      authors
    };
  });
}
