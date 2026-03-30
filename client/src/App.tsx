import { useMemo, useState } from 'react';
import type { AtlasGraphDTO } from './lib/types';
import { assignCommunities, buildClusterSummaries } from './lib/clustering';
import { GraphView } from './components/GraphView';
import { DetailsPanel } from './components/DetailsPanel';

const API = import.meta.env.VITE_API_BASE ?? '/api';

export function App() {
  const [query, setQuery] = useState('');
  const [activeQuery, setActiveQuery] = useState('');
  const [graph, setGraph] = useState<AtlasGraphDTO | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mode, setMode] = useState<'overview' | 'story'>('overview');

  const communities = useMemo(() => graph ? assignCommunities(graph) : new Map<string, number>(), [graph]);
  const summaries = useMemo(() => graph ? buildClusterSummaries(graph, communities) : [], [graph, communities]);
  const selectedNode = graph?.nodes.find((n) => n.id === selectedId) ?? null;

  async function search(topic: string) {
    setLoading(true); setError(null); setSelectedId(null);
    try {
      const resp = await fetch(`${API}/search?topic=${encodeURIComponent(topic)}`);
      if (!resp.ok) throw new Error(`Search failed (${resp.status})`);
      const data = await resp.json() as AtlasGraphDTO;
      setGraph(data); setActiveQuery(topic);
    } catch (e) { setError(String(e)); }
    finally { setLoading(false); }
  }

  if (!graph) return <div className='landing'>
    <h1>Atlas of Ideas</h1>
    <p>A multiscale knowledge atlas for papers, authors, institutions, and ideas.</p>
    <div className='searchRow'>
      <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder='Search a topic…'/>
      <button onClick={() => search(query)}>Explore</button>
    </div>
    <div className='examples'>{['diffusion models','CRISPR','reinforcement learning','topology optimization'].map((x)=><button key={x} onClick={()=>{setQuery(x); search(x);}}>{x}</button>)}</div>
    {loading && <p>Building atlas…</p>}
    {error && <p className='error'>{error}</p>}
  </div>;

  return <div className='shell'>
    <header>
      <strong>{activeQuery}</strong>
      <div>
        <button onClick={() => setMode('overview')} className={mode==='overview'?'active':''}>Overview</button>
        <button onClick={() => setMode('story')} className={mode==='story'?'active':''}>Story mode</button>
        <button onClick={() => { setGraph(null); setMode('overview'); }}>New search</button>
      </div>
    </header>
    <main>
      <GraphView graph={graph} communities={communities} mode={mode} selectedId={selectedId} onSelect={setSelectedId} />
      <DetailsPanel node={selectedNode} graph={graph} summaries={summaries} communities={communities} />
    </main>
  </div>;
}
