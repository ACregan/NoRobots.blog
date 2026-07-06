# norobots.blog

Personal blog served from AT Protocol content. Posts are written in [Scribe CMS](https://scribe-cms.app) and stored in a Bluesky PDS under the site.standard lexicon compliant `site.standard.publication` and `site.standard.document` collections. This site fetches and renders that content publicly.

## Stack

- [React Router v7](https://reactrouter.com/) — framework mode, SSR
- [`@scribe-atp/core`](https://www.npmjs.com/package/@scribe-atp/core) — AT Protocol content fetching
- [`@scribe-atp/react-router-framework`](https://www.npmjs.com/package/@scribe-atp/react-router-framework) — site and article loaders
- TypeScript (strict)
- Vitest + Testing Library

## Development

```bash
npm install
npm run dev
```

## Testing

```bash
npm run test:run   # run once
npm test           # watch mode
npm run typecheck  # type check only
```

## Deployment

GitLab CI pipeline with three stages: `typecheck` and `unit` on merge requests, `deploy` (manual) on the default branch. Deploy pulls and rebuilds on the VPS via SSH.

```bash
npm run build
npm start   # PORT=3006
```
