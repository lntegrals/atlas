import { PretextLayoutManager } from '../lib/textLayoutManager';
import type { AtlasGraphDTO, AtlasNode } from '../lib/types';

const tm = new PretextLayoutManager();

export function DetailsPanel({ node, graph, summaries, communities }: { node: AtlasNode | null; graph: AtlasGraphDTO; summaries: any[]; communities: Map<string, number> }) {
  if (!node) return <aside className='panel'><h3>Cluster snapshots</h3>{summaries.slice(0, 4).map((s) => {
    const layout = tm.layout({ text: s.summary, width: 280, fontSize: 13, lineHeight: 18, maxLines: 5 });
    return <article key={s.community}><h4>{s.title}</h4>{layout.lines.map((ln: string, i: number) => <p key={i}>{ln}</p>)}</article>;
  })}</aside>;

  const neighbors = graph.edges.filter((e) => e.source===node.id || e.target===node.id).slice(0, 8);
  const summary = tm.layout({ text: String(node.metadata?.abstract ?? `${node.label} is a ${node.type} in this atlas cluster.`), width: 300, fontSize: 14, lineHeight: 20, maxLines: 6 });
  return <aside className='panel'>
    <h3>{node.label}</h3>
    <div className='pill'>{node.type} · cluster {communities.get(node.id) ?? 'n/a'}</div>
    {summary.lines.map((ln, i) => <p key={i}>{ln}</p>)}
    <h4>Connected entities</h4>
    <ul>{neighbors.map((e) => <li key={e.id}>{e.type}: {e.source === node.id ? e.target : e.source}</li>)}</ul>
  </aside>;
}
