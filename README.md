# Atlas of Ideas

A multiscale, premium-feeling knowledge atlas that turns a topic into an explorable world of works, authors, institutions, and topics.

## Tech
- React + TypeScript + Vite (client)
- Node + Express proxy (server)
- Graphology + Louvain clustering
- d3-force overview mode
- elkjs story mode
- Pretext-driven multiline text via `@chenglou/pretext` package (local workspace implementation)

## Setup
1. Copy env file:
   ```bash
   cp .env.example .env
   ```
2. Install:
   ```bash
   npm install
   ```
3. Run dev:
   ```bash
   npm run dev
   ```
4. Open client: `http://localhost:5173`

## Build
```bash
npm run build
```

## Test
```bash
npm test
```

## Architecture
- `client/` UI shell, graph canvas, story mode, responsive detail surface.
- `server/` OpenAlex + Wikimedia + Wikidata proxy with in-memory TTL cache.
- `shared/` graph construction, clustering, summaries, layouts, pretext text layout manager.
- `packages/pretext/` local `@chenglou/pretext` implementation used as core text layout primitive.

## Notes
- Frontend calls only backend `/api/*` routes.
- The graph build is bounded for responsiveness (target 150–400 nodes).
- If OpenAlex quota/rate limits occur, the app surfaces graceful errors.


## Vercel deployment
- Build command: `npm run build -w client`
- Output directory: `client/dist`
- API routes are served by `api/index.ts` (which reuses `server/src/app.ts`).
