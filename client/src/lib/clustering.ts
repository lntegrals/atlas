import type { AtlasGraphDTO } from './types';

export function assignCommunities(graph: AtlasGraphDTO): Map<string, number> {
  const adjacency = new Map<string, Set<string>>();
  graph.nodes.forEach((n) => adjacency.set(n.id, new Set()));
  graph.edges.forEach((e) => {
    adjacency.get(e.source)?.add(e.target);
    adjacency.get(e.target)?.add(e.source);
  });

  const result = new Map<string, number>();
  let community = 0;
  for (const n of graph.nodes) {
    if (result.has(n.id)) continue;
    const queue = [n.id];
    while (queue.length) {
      const cur = queue.shift()!;
      if (result.has(cur)) continue;
      result.set(cur, community);
      for (const next of adjacency.get(cur) ?? []) if (!result.has(next)) queue.push(next);
    }
    community += 1;
  }
  return result;
}

export function buildClusterSummaries(graph: AtlasGraphDTO, communities: Map<string, number>) {
  const grouped = new Map<number, string[]>();
  communities.forEach((cluster, nodeId) => {
    if (!grouped.has(cluster)) grouped.set(cluster, []);
    grouped.get(cluster)!.push(nodeId);
  });

  return Array.from(grouped.entries()).map(([community, ids]) => {
    const nodes = graph.nodes.filter((n) => ids.includes(n.id));
    const topics = nodes.filter((n) => n.type === 'topic').slice(0, 3).map((n) => n.label);
    const works = nodes.filter((n) => n.type === 'work').slice(0, 3).map((n) => n.label);
    const authors = nodes.filter((n) => n.type === 'author').slice(0, 2).map((n) => n.label);
    return {
      community,
      title: topics[0] ?? `Cluster ${community}`,
      summary: `This cluster connects ${works.length} works and ${authors.length} authors around ${topics.join(', ') || 'mixed themes'}.`,
      works,
      authors
    };
  });
}
