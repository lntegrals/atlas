import { describe, it, expect } from 'vitest';
import { buildHeterogeneousGraph } from '../src/graphBuilder';

describe('graph builder', () => {
  it('builds heterogeneous nodes and edges', () => {
    const graph = buildHeterogeneousGraph([{ id: 'w1', title: 'Paper', authorships: [{ author: { id: 'a1', display_name: 'Ada' }, institutions: [{ id: 'i1', display_name: 'MIT' }] }], topics: [{ id: 't1', display_name: 'ML', score: 0.9 }], referenced_works: ['w2'] }]);
    expect(graph.nodes.some((n) => n.type === 'work')).toBe(true);
    expect(graph.nodes.some((n) => n.type === 'author')).toBe(true);
    expect(graph.nodes.some((n) => n.type === 'institution')).toBe(true);
    expect(graph.nodes.some((n) => n.type === 'topic')).toBe(true);
    expect(graph.edges.length).toBeGreaterThan(0);
  });
});
