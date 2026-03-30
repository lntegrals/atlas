import { PretextLayoutManager, type AtlasEdge, type AtlasGraphDTO, type AtlasNode, type ClusterSummary } from '@atlas/shared';

const tm = new PretextLayoutManager();

type DetailsPanelProps = {
  node: AtlasNode | null;
  graph: AtlasGraphDTO;
  summaries: ClusterSummary[];
  communities: Map<string, number>;
};

export function DetailsPanel({ node, graph, summaries, communities }: DetailsPanelProps) {
  if (!node) return <aside className='panel'><h3>Cluster snapshots</h3>{summaries.slice(0, 4).map((summary) => {
    const layout = tm.layout({ text: summary.summary, width: 280, fontSize: 13, lineHeight: 18, maxLines: 5 });
    return <article key={summary.community}><h4>{summary.title}</h4>{layout.lines.map((line: string, index: number) => <p key={index}>{line}</p>)}</article>;
  })}</aside>;

  const neighbors = graph.edges.filter((edge: AtlasEdge) => edge.source === node.id || edge.target === node.id).slice(0, 8);
  const summary = tm.layout({ text: String(node.metadata?.abstract ?? `${node.label} is a ${node.type} in this atlas cluster.`), width: 300, fontSize: 14, lineHeight: 20, maxLines: 6 });
  return <aside className='panel'>
    <h3>{node.label}</h3>
    <div className='pill'>{node.type} · cluster {communities.get(node.id) ?? 'n/a'}</div>
    {summary.lines.map((line: string, index: number) => <p key={index}>{line}</p>)}
    <h4>Connected entities</h4>
    <ul>{neighbors.map((edge: AtlasEdge) => <li key={edge.id}>{edge.type}: {edge.source === node.id ? edge.target : edge.source}</li>)}</ul>
  </aside>;
}
