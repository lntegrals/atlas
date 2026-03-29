import { describe, it, expect } from 'vitest';
import { assignCommunities } from '../src/clustering';

it('assigns communities', () => {
  const c = assignCommunities({
    nodes: [{ id: 'a', label: 'a', type: 'work', score: 1 }, { id: 'b', label: 'b', type: 'work', score: 1 }],
    edges: [{ id: 'a-b', source: 'a', target: 'b', type: 'citation', weight: 1 }]
  });
  expect(c.has('a')).toBe(true);
});
