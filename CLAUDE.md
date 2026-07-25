# norobots.blog

Personal blog driven by AT Protocol content via the Scribe SDK. Authors write in Scribe CMS; this site fetches and renders that content publicly.

## Stack

- **React Router v8** (framework mode, SSR enabled)
- **TypeScript** (strict mode)
- **Vitest** + **@testing-library/react** — unit/component tests
- **@scribe-atp/core** — `fetchSite`, `fetchArticleBySlug`, `generateFeed`, `getSitemapEntries`, `withRetry`, `NotFoundError`
- **@scribe-atp/react-router-framework** — `articleMeta` (canonical + JSON-LD for `post.tsx`'s `meta()`)
- **npm** — package manager

## Scribe config

`app/config.ts`:
```ts
SITE_AUTHOR = "norobots.blog"
SITE_URL    = "https://norobots.blog"
```

No `urlPrefix` — articles live directly under `/:groupSlug/:articleSlug`.

## Routes

```
/                         home.tsx          — all groups + articles via fetchSite
/:groupSlug               group/group.tsx   — single group view via fetchSite
/:groupSlug/:articleSlug  post/post.tsx     — article via fetchArticleBySlug + fetchSite
tag/:tag                  tag/tag.tsx       — articles matching a tag via fetchSite
feed.xml                  routes/feed.ts    — RSS 2.0 resource route
sitemap.xml               routes/sitemap.ts — XML sitemap resource route
robots.txt                routes/robots.ts  — plain-text resource route, points at sitemap.xml
.well-known/site.standard.publication  routes/well-known-publication.ts — resolves the publication URI
```

Resource routes (`feed.ts`, `sitemap.ts`, `robots.ts`) export only a `loader` — no default export.

## PDS fetch resilience

`home.tsx`, `post.tsx`, `group.tsx`, and `tag.tsx` all wrap their `@scribe-atp/core` calls in `app/lib/pdsRetry.server.ts`'s `fetchWithFastPath()`:

1. **Fast path** — attempt the fetch once, synchronously, exactly as before. This is what runs on every normal request; `meta()`/canonical/JSON-LD stay untouched.
2. **On failure** — if the error is `NotFoundError`, rethrow immediately (existing 404 handling runs, no retry, no spinner). Otherwise switch to streaming: return `{ status: "retrying", data: <promise> }` and let the loader return immediately.
3. **In the component** — `status: "retrying"` renders `<Suspense fallback={<PdsRetrySpinner />}><Await resolve={...} errorElement={<PdsDownError />}>`. The promise is `withRetry(fn, { attempts: 4, signal })` — 4 more attempts with exponential backoff (300/600/1200/2400ms), for 5 total attempts including the fast path.
4. **If all 5 fail** — `PdsDownError` renders a "PDS is down, try again" page with a reload button. It also checks `instanceof NotFoundError` for the rare case where a record disappears mid-retry, rendering the 404 UI instead.

`app/entry.server.tsx` is a customized copy of React Router's default (not the stock template) — `streamTimeout` is raised to 20s (default is 4950ms) so the retry sequence has room to finish, plus a process-level `unhandledRejection` guard per React Router's streaming docs.

`feed.ts`/`sitemap.ts`/`robots.ts` deliberately do **not** get this treatment — they're non-JSX resource routes with nothing to suspend.

Same pattern, independently implemented per site (not shared code), on `perpetual-summer-ltd` and `anthonycregan.co.uk-2025`. `scribe-atp-reader` has its own richer version (3-way error classification, since visitors there can type any handle).

## SEO / discoverability

- **Never derive the public origin from `request.url`.** `feed.ts`, `sitemap.ts`, and `robots.ts` all anchor to the `SITE_URL` config constant, not `new URL(request.url).origin`. Behind the nginx reverse proxy, `@react-router/serve` never trusts `X-Forwarded-Proto` (it's a sealed CLI with no `app.set('trust proxy', ...)` exposed), so `request.url` always reports `http://` in production regardless of the real scheme — anchoring to `SITE_URL` sidesteps that entirely. If you add another route that needs an absolute URL, follow the same pattern.
- `root.tsx`'s `links` export includes the RSS `<link rel="alternate" type="application/rss+xml">` autodiscovery tag, and the footer (also in `root.tsx`) has a visible "RSS Feed" link (`RssIcon` in `SvgImage.tsx`) next to BlueSky.
- Article pages (`post.tsx`) get a canonical link tag + `BlogPosting` JSON-LD automatically via `articleMeta` from `@scribe-atp/react-router-framework`.
- The home page (`home.tsx`) adds a canonical link tag + `WebSite` JSON-LD via the standalone `buildSiteUrl`/`generateSiteJsonLd` helpers from `@scribe-atp/core` — deliberately not the full `siteMeta()` output, since that would replace the hand-written title/description with the (less brand-voiced) copy from the site record.
- Group pages (`group.tsx`) and any future tag/listing pages do **not** have canonical/JSON-LD — their loaders only fetch the filtered group data, not the full `Site`. Known gap, deliberately left as-is (2026-07-23).

## Article links

`ArticleTile` receives `groupSlug` and `slug` (article slug) and links to `/${groupSlug}/${slug}`. Both `home.tsx` (iterating groups) and `group/group.tsx` pass `groupSlug` explicitly — do not remove it.

## Sitemap

`getSitemapEntries` returns `SitemapEntry[]`; the route converts to XML. No `STATIC_PAGES` — this site has no non-Scribe routes to include.

## Analytics

Umami (cookie-free) via `https://analytics.perpetualsummer.ltd/script.js`. No GA integration.

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
