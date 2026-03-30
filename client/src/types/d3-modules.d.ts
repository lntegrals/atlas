declare module 'd3-force' {
  export interface SimulationNodeDatum {
    index?: number;
    x?: number;
    y?: number;
    vx?: number;
    vy?: number;
  }

  export interface SimulationLinkDatum<NodeDatum extends SimulationNodeDatum> {
    source: string | NodeDatum;
    target: string | NodeDatum;
    index?: number;
  }

  export interface ForceSimulation<NodeDatum extends SimulationNodeDatum> {
    force(name: string, force: unknown): ForceSimulation<NodeDatum>;
    alphaDecay(decay: number): ForceSimulation<NodeDatum>;
    on(type: 'tick', listener: () => void): ForceSimulation<NodeDatum>;
    stop(): void;
  }

  export interface ForceManyBody<NodeDatum extends SimulationNodeDatum> {
    strength(strength: number): ForceManyBody<NodeDatum>;
  }

  export interface ForceLink<NodeDatum extends SimulationNodeDatum, LinkDatum extends SimulationLinkDatum<NodeDatum>> {
    id(accessor: (node: NodeDatum) => string): ForceLink<NodeDatum, LinkDatum>;
    distance(distance: number): ForceLink<NodeDatum, LinkDatum>;
  }

  export function forceSimulation<NodeDatum extends SimulationNodeDatum>(nodes: NodeDatum[]): ForceSimulation<NodeDatum>;
  export function forceManyBody<NodeDatum extends SimulationNodeDatum>(): ForceManyBody<NodeDatum>;
  export function forceLink<NodeDatum extends SimulationNodeDatum, LinkDatum extends SimulationLinkDatum<NodeDatum>>(links: LinkDatum[]): ForceLink<NodeDatum, LinkDatum>;
  export function forceCollide<NodeDatum extends SimulationNodeDatum>(radius: number): unknown;
  export function forceCenter(x: number, y: number): unknown;
}

declare module 'd3-selection' {
  interface Selection {
    select<ChildElement extends Element = Element>(selector: string): Selection;
    selectAll(selector: string): Selection;
    remove(): Selection;
    append(tagName: string): Selection;
    attr(name: string, value: string | number): Selection;
    text(value: string): Selection;
    on(type: string, listener: () => void): Selection;
    call(fn: (selection: Selection) => void): Selection;
  }

  export function select<ElementType extends Element>(element: ElementType): Selection;
}

declare module 'd3-zoom' {
  export interface ZoomTransform {
    toString(): string;
  }

  export interface D3ZoomEvent<ElementType extends Element, Datum> {
    transform: ZoomTransform;
  }

  export interface ZoomBehavior<ElementType extends Element, Datum> {
    scaleExtent(extent: [number, number]): ZoomBehavior<ElementType, Datum>;
    on(type: 'zoom', listener: (event: D3ZoomEvent<ElementType, Datum>) => void): ZoomBehavior<ElementType, Datum>;
  }

  export function zoom<ElementType extends Element, Datum>(): ZoomBehavior<ElementType, Datum>;
}
