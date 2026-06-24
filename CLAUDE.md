# norobots.blog

Personal blog driven by AT Protocol content via the Scribe SDK. Authors write in Scribe CMS; this site fetches and renders that content publicly.

## Stack

- **React Router v7** (framework mode, SSR enabled)
- **TypeScript** (strict mode)
- **Vitest** + **@testing-library/react** — unit/component tests
- **@scribe-atp/core** — `fetchSite`, `fetchArticle`, `generateFeed`, `getSitemapEntries`
- **@scribe-atp/react-router-framework** — `createSiteLoader`, `createArticleLoader`
- **npm** — package manager

## Scribe config

`app/config.ts`:
```ts
SITE_AUTHOR = "anthonycregan.dev"
SITE_SLUG    = "norobots-blog"
```

No `urlPrefix` — articles live directly under `/:groupSlug/:articleSlug`.

## Routes

```
/                         home.tsx          — all groups + articles via createSiteLoader
/:groupSlug               group/group.tsx   — single group view via fetchSite
/:groupSlug/:articleSlug  post/post.tsx     — article via createArticleLoader
feed.xml                  routes/feed.ts    — RSS 2.0 resource route
sitemap.xml               routes/sitemap.ts — XML sitemap resource route
```

Resource routes (`feed.ts`, `sitemap.ts`) export only a `loader` — no default export.

## Article links

`ArticleTile` receives `groupSlug` and `slug` (article slug) and links to `/${groupSlug}/${slug}`. Both `home.tsx` (iterating groups) and `group/group.tsx` pass `groupSlug` explicitly — do not remove it.

## Sitemap

`getSitemapEntries` returns `SitemapEntry[]`; the route converts to XML. No `STATIC_PAGES` — this site has no non-Scribe routes to include.

## Analytics

Google Analytics 4 via `app/hooks/GoogleAnalytics.ts`. Measurement ID: `G-Z6N3C35PLR` (in `app/config.ts`). Events are tracked client-side via `trackClientAnalyticsEvent`.

## React Router future flags

`react-router.config.ts` opts in to all v8 future flags (`v8_middleware`, `v8_splitRouteModules`, `v8_viteEnvironmentApi`, `v8_passThroughRequests`, `v8_trailingSlashAwareDataRequests`).

## CI (GitLab)

Runner tag: `SERVER-docker-runner`. Node 22. Three stages:

| Stage | When |
| ----- | ---- |
| `typecheck` | MR events touching TS/JS/JSON |
| `unit` | MR events touching TS/TSX/JS/CSS/JSON |
| `deploy` | Manual, on default branch only |

Deploy calls `~/server/deploy.sh norobots.blog` over SSH on the VPS. Credentials via `SSH_DEPLOY_KEY` and `SSH_KNOWN_HOSTS` CI variables.

## Key commands

```bash
npm install
npm run dev
npm run typecheck
npm run test:run
npm run build
```
