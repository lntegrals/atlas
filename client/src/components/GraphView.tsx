import { useEffect, useMemo, useRef } from 'react';
import { forceCenter, forceCollide, forceLink, forceManyBody, forceSimulation } from 'd3-force';
import { zoom } from 'd3-zoom';
import { select } from 'd3-selection';
import type { AtlasGraphDTO } from '@atlas/shared';
import { buildStoryLayout, PretextLayoutManager } from '@atlas/shared';

const textManager = new PretextLayoutManager();

type Props = { graph: AtlasGraphDTO; communities: Map<string, number>; mode: 'overview' | 'story'; selectedId: string | null; onSelect: (id: string) => void; };

export function GraphView({ graph, communities, mode, selectedId, onSelect }: Props) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const positions = useRef(new Map<string, { x: number; y: number }>());

  useEffect(() => {
    if (mode !== 'overview') return;
    const nodes = graph.nodes.map((n) => ({ ...n, x: Math.random() * 800, y: Math.random() * 600 }));
    const sim = forceSimulation(nodes as any)
      .force('charge', forceManyBody().strength(-80))
      .force('link', forceLink(graph.edges as any).id((d: any) => d.id).distance(60))
      .force('collide', forceCollide(18))
      .force('center', forceCenter(450, 320))
      .alphaDecay(0.06)
      .on('tick', () => {
        nodes.forEach((n: any) => positions.current.set(n.id, { x: n.x, y: n.y }));
        draw();
      });
    return () => sim.stop();
  }, [graph, mode]);

  useEffect(() => { (async () => {
    if (mode !== 'story' || !selectedId) return;
    const story = await buildStoryLayout(graph, selectedId);
    positions.current = story.positions;
    draw();
  })(); }, [mode, selectedId, graph]);

  function draw() {
    const svg = svgRef.current; if (!svg) return;
    const g = select(svg).select<SVGGElement>('g.scene');
    g.selectAll('*').remove();
    graph.edges.forEach((e) => {
      const s = positions.current.get(e.source); const t = positions.current.get(e.target); if (!s || !t) return;
      g.append('line').attr('x1', s.x).attr('y1', s.y).attr('x2', t.x).attr('y2', t.y).attr('stroke', 'rgba(180,210,255,0.16)');
    });
    graph.nodes.forEach((n) => {
      const p = positions.current.get(n.id); if (!p) return;
      const c = (communities.get(n.id) ?? 0) * 47 % 360;
      g.append('circle').attr('cx', p.x).attr('cy', p.y).attr('r', selectedId===n.id ? 9 : 6).attr('fill', `hsl(${c} 75% 65%)`).on('click', () => onSelect(n.id));
      const l = textManager.layout({ text: n.label, width: 140, fontSize: 12, lineHeight: 15, maxLines: 2 });
      l.lines.forEach((line, i) => {
        g.append('text').attr('x', p.x + 10).attr('y', p.y + i * l.lineHeight).attr('fill', 'rgba(245,248,255,0.88)').attr('font-size', 11).text(line);
      });
    });
  }

  useEffect(() => {
    const svg = svgRef.current; if (!svg) return;
    const scene = select(svg).select<SVGGElement>('g.scene');
    const z = zoom<SVGSVGElement, unknown>().scaleExtent([0.4, 6]).on('zoom', (e) => scene.attr('transform', e.transform.toString()));
    select(svg).call(z as any);
    draw();
  }, [graph, communities, selectedId]);

  const hint = useMemo(() => mode === 'story' ? 'Story mode: directional explanatory pocket.' : 'Overview mode: multiscale exploratory force atlas.', [mode]);
  return <section className='graphWrap'><svg ref={svgRef} viewBox='0 0 900 640'><g className='scene' /></svg><div className='hint'>{hint}</div></section>;
}
