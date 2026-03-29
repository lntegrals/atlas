import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { buildHeterogeneousGraph } from '@atlas/shared';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const cache = new Map<string, { expires: number; value: unknown }>();
const ttlMs = 1000 * 60 * 10;

async function withCache<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const hit = cache.get(key);
  if (hit && hit.expires > Date.now()) return hit.value as T;
  const value = await fn();
  cache.set(key, { expires: Date.now() + ttlMs, value });
  return value;
}

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.get('/api/search', async (req, res) => {
  const topic = String(req.query.topic ?? '').trim();
  if (!topic) return res.status(400).json({ error: 'topic is required' });
  try {
    const data = await withCache(`openalex:${topic}`, async () => {
      const apiKey = process.env.OPENALEX_API_KEY;
      const params = new URLSearchParams({ search: topic, per_page: '60', select: 'id,title,cited_by_count,abstract_inverted_index,authorships,topics,referenced_works' });
      if (apiKey) params.set('api_key', apiKey);
      const resp = await fetch(`https://api.openalex.org/works?${params.toString()}`);
      if (!resp.ok) throw new Error(`OpenAlex error ${resp.status}`);
      const json = await resp.json() as { results: any[] };
      const works = (json.results ?? []).map((w) => ({
        id: w.id,
        title: w.title,
        cited_by_count: w.cited_by_count,
        abstract: w.abstract_inverted_index ? Object.keys(w.abstract_inverted_index).join(' ').slice(0, 500) : undefined,
        topics: (w.topics ?? []).map((t: any) => ({ id: t.id, display_name: t.display_name, score: t.score })),
        authorships: (w.authorships ?? []).map((a: any) => ({
          author: { id: a.author?.id, display_name: a.author?.display_name },
          institutions: (a.institutions ?? []).map((i: any) => ({ id: i.id, display_name: i.display_name }))
        })),
        referenced_works: w.referenced_works ?? []
      }));
      return buildHeterogeneousGraph(works);
    });
    res.json(data);
  } catch (error) {
    res.status(502).json({ error: 'Failed to fetch OpenAlex', detail: String(error) });
  }
});

app.get('/api/enrich/wikipedia', async (req, res) => {
  const title = String(req.query.title ?? '').trim();
  if (!title) return res.status(400).json({ error: 'title required' });
  const value = await withCache(`wiki:${title}`, async () => {
    const resp = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`);
    if (!resp.ok) return null;
    return resp.json();
  });
  res.json(value);
});

app.get('/api/enrich/wikidata', async (req, res) => {
  const id = String(req.query.id ?? '').trim();
  if (!id) return res.status(400).json({ error: 'id required' });
  const value = await withCache(`wikidata:${id}`, async () => {
    const resp = await fetch(`https://www.wikidata.org/wiki/Special:EntityData/${encodeURIComponent(id)}.json`);
    if (!resp.ok) return null;
    return resp.json();
  });
  res.json(value);
});

const port = Number(process.env.PORT ?? 8787);
app.listen(port, () => console.log(`Atlas server on http://localhost:${port}`));
