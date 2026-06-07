import { z } from "zod";

// ── Exported domain types ────────────────────────────────────────────────────

export interface ArticleRef {
  uri: string;
  title: string;
  url?: string;
  splashImageUrl: string | null;
  synopsis?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface SiteGroup {
  slug: string;
  title: string;
  articles: ArticleRef[];
}

export interface Site {
  title: string;
  url: string;
  urlPrefix: string;
  description?: string;
  splashImageUrl?: string;
  logoImageUrl?: string;
  groups: SiteGroup[];
  ungroupedArticles: ArticleRef[];
}

export interface Article {
  title: string;
  content: string;
  url: string;
  splashImageUrl?: string;
  synopsis?: string;
  createdAt: string;
  updatedAt?: string;
}

// ── Internal schemas ─────────────────────────────────────────────────────────

const ArticleRefSchema = z.object({
  uri: z.string(),
  title: z.string(),
  url: z.string().optional(),
  splashImageUrl: z.string().nullable(),
  synopsis: z.string().nullish(),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
});

const SiteGroupSchema = z.object({
  slug: z.string(),
  title: z.string(),
  articles: z.array(ArticleRefSchema).default([]),
});

const SiteSchema = z.object({
  title: z.string().default(""),
  url: z.string().default(""),
  urlPrefix: z.string().default(""),
  description: z.string().optional(),
  splashImageUrl: z.string().optional(),
  logoImageUrl: z.string().optional(),
  groups: z.array(SiteGroupSchema).default([]),
  ungroupedArticles: z.array(ArticleRefSchema).default([]),
});

const ArticleValueSchema = z.object({
  title: z.string().default(""),
  content: z.string().default(""),
  url: z.string().optional(),
  splashImageUrl: z.string().optional(),
  synopsis: z.string().optional(),
  createdAt: z.string().default(""),
  updatedAt: z.string().optional(),
});

// ── Protocol internals ───────────────────────────────────────────────────────

const PUBLIC_API = "https://public.api.bsky.app";

async function resolveIdentifier(handleOrDid: string): Promise<string> {
  if (handleOrDid.startsWith("did:")) return handleOrDid;
  const res = await fetch(
    `${PUBLIC_API}/xrpc/com.atproto.identity.resolveHandle?handle=${encodeURIComponent(handleOrDid)}`,
  );
  if (!res.ok)
    throw new Error(
      `Could not resolve handle "${handleOrDid}": ${res.statusText}`,
    );
  const data = await res.json();
  return data.did as string;
}

async function resolvePDS(did: string): Promise<string> {
  const res = await fetch(`https://plc.directory/${encodeURIComponent(did)}`);
  if (!res.ok) throw new Error(`Could not resolve DID document for "${did}"`);
  const doc = await res.json();
  const service = (
    doc.service as { type: string; serviceEndpoint: string }[]
  )?.find((s) => s.type === "AtprotoPersonalDataServer");
  if (!service) throw new Error(`No PDS found in DID document for "${did}"`);
  return service.serviceEndpoint;
}

async function getRecord(
  author: string,
  collection: string,
  rkey: string,
): Promise<unknown> {
  const did = await resolveIdentifier(author);
  const pds = await resolvePDS(did);
  const res = await fetch(
    `${pds}/xrpc/com.atproto.repo.getRecord?repo=${encodeURIComponent(did)}&collection=${encodeURIComponent(collection)}&rkey=${encodeURIComponent(rkey)}`,
  );
  if (res.status === 404)
    throw new Error(`Record "${collection}/${rkey}" not found`);
  if (!res.ok) throw new Error(`Failed to fetch record: ${res.statusText}`);
  const { value } = await res.json();
  return value;
}

// ── Public API ───────────────────────────────────────────────────────────────

export async function getSite(
  author: string,
  siteSlug: string,
): Promise<Site> {
  const value = await getRecord(author, "app.scribe.site", siteSlug);
  return SiteSchema.parse(value);
}

export async function getArticle(
  author: string,
  articleSlug: string,
): Promise<Article> {
  const value = await getRecord(author, "app.scribe.article", articleSlug);
  const parsed = ArticleValueSchema.parse(value);
  return { ...parsed, url: parsed.url ?? articleSlug };
}
