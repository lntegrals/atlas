import { describe, it, expect } from 'vitest';
import { PretextLayoutManager } from '../src/textLayoutManager';

describe('pretext manager', () => {
  it('caches layout entries', () => {
    const m = new PretextLayoutManager();
    m.layout({ text: 'hello world from atlas', width: 120, fontSize: 14, lineHeight: 20 });
    m.layout({ text: 'hello world from atlas', width: 126, fontSize: 14, lineHeight: 20 });
    expect(m.cacheSize()).toBe(1);
  });
});
