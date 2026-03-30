import { useEffect, useMemo, useRef } from 'react';
import { forceCenter, forceCollide, forceLink, forceManyBody, forceSimulation, type SimulationLinkDatum, type SimulationNodeDatum } from 'd3-force';
import { zoom, type D3ZoomEvent } from 'd3-zoom';
import { select } from 'd3-selection';
import type { AtlasEdge, AtlasGraphDTO, AtlasNode } from '@atlas/shared';
import { buildStoryLayout, PretextLayoutManager } from '@atlas/shared';

const textManager = new PretextLayoutManager();

type SimulationNode = AtlasNode & SimulationNodeDatum;
type SimulationEdge = AtlasEdge & SimulationLinkDatum<SimulationNode>;

type Props = {
  graph: AtlasGraphDTO;
  communities: Map<string, number>;
  mode: 'overview' | 'story';
  selectedId: string | null;
  onSelect: (id: string) => void;
};

export function GraphView({ graph, communities, mode, selectedId, onSelect }: Props) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const positions = useRef(new Map<string, { x: number; y: number }>());

  useEffect(() => {
    if (mode !== 'overview') return;

    const nodes: SimulationNode[] = graph.nodes.map((node) => ({ ...node, x: Math.random() * 800, y: Math.random() * 600 }));
    const edges: SimulationEdge[] = graph.edges.map((edge) => ({ ...edge }));

    const sim = forceSimulation<SimulationNode>(nodes)
      .force('charge', forceManyBody<SimulationNode>().strength(-80))
      .force('link', forceLink<SimulationNode, SimulationEdge>(edges).id((node) => node.id).distance(60))
      .force('collide', forceCollide<SimulationNode>(18))
      .force('center', forceCenter(450, 320))
      .alphaDecay(0.06)
      .on('tick', () => {
        nodes.forEach((node) => positions.current.set(node.id, { x: node.x ?? 0, y: node.y ?? 0 }));
        draw();
      });

    return () => sim.stop();
  }, [graph, mode]);

  useEffect(() => {
    (async () => {
      if (mode !== 'story' || !selectedId) return;
      const story = await buildStoryLayout(graph, selectedId);
      positions.current = story.positions;
      draw();
    })();
  }, [mode, selectedId, graph]);

  function draw() {
    const svg = svgRef.current;
    if (!svg) return;

    const g = select(svg).select<SVGGElement>('g.scene');
    g.selectAll('*').remove();

    graph.edges.forEach((edge) => {
      const source = positions.current.get(edge.source);
      const target = positions.current.get(edge.target);
      if (!source || !target) return;

      g.append('line').attr('x1', source.x).attr('y1', source.y).attr('x2', target.x).attr('y2', target.y).attr('stroke', 'rgba(180,210,255,0.16)');
    });

    graph.nodes.forEach((node) => {
      const position = positions.current.get(node.id);
      if (!position) return;

      const color = ((communities.get(node.id) ?? 0) * 47) % 360;
      g.append('circle').attr('cx', position.x).attr('cy', position.y).attr('r', selectedId === node.id ? 9 : 6).attr('fill', `hsl(${color} 75% 65%)`).on('click', () => onSelect(node.id));

      const layout = textManager.layout({ text: node.label, width: 140, fontSize: 12, lineHeight: 15, maxLines: 2 });
      layout.lines.forEach((line: string, index: number) => {
        g.append('text').attr('x', position.x + 10).attr('y', position.y + index * layout.lineHeight).attr('fill', 'rgba(245,248,255,0.88)').attr('font-size', 11).text(line);
      });
    });
  }

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const scene = select(svg).select<SVGGElement>('g.scene');
    const z = zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.4, 6])
      .on('zoom', (event: D3ZoomEvent<SVGSVGElement, unknown>) => scene.attr('transform', event.transform.toString()));
    select(svg).call(z as unknown as (selection: unknown) => void);
    draw();
  }, [graph, communities, selectedId]);

  const hint = useMemo(() => mode === 'story' ? 'Story mode: directional explanatory pocket.' : 'Overview mode: multiscale exploratory force atlas.', [mode]);
  return <section className='graphWrap'><svg ref={svgRef} viewBox='0 0 900 640'><g className='scene' /></svg><div className='hint'>{hint}</div></section>;
}
