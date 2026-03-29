export type NodeType = 'work' | 'author' | 'institution' | 'topic';
export type EdgeType = 'authorship' | 'affiliation' | 'topic' | 'citation';

export interface AtlasNode {
  id: string;
  label: string;
  type: NodeType;
  score: number;
  metadata?: Record<string, unknown>;
}

export interface AtlasEdge {
  id: string;
  source: string;
  target: string;
  type: EdgeType;
  weight: number;
}

export interface AtlasGraphDTO {
  nodes: AtlasNode[];
  edges: AtlasEdge[];
}
