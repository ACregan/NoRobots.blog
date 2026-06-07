import type { Route } from "./+types/home";
import ArticleTile from "./ArticleTile/ArticleTile";
import type { Article } from "~/types/types";
import styles from "./home.module.css";
//https://www.npmjs.com/package/@atproto/api

export function meta({}: Route.MetaArgs) {
  return [
    { title: "NoRobots.blog" },
    {
      name: "description",
      content:
        "Creative writing and news from the front line of the machine resistance. 100% Human-produced content. No Language Models were used in the production of this weblog.",
    },
  ];
}

// NEW
interface ArticleRef {
  uri: string;
  title: string;
  url?: string;
  splashImageUrl: string | null;
  synopsis?: string | null;
  createdAt: string;
  updatedAt?: string;
}
interface SiteGroup {
  slug: string;
  title: string;
  articles: ArticleRef[];
}
interface Site {
  title: string;
  url: string;
  urlPrefix: string;
  description?: string;
  splashImageUrl?: string;
  logoImageUrl?: string;
  groups: SiteGroup[];
  articles: ArticleRef[];
}
interface SiteWithAuthor extends Site {
  author: string;
}

export const PUBLIC_API = "https://public.api.bsky.app";

export async function resolveIdentifier(handleOrDid: string): Promise<string> {
  if (handleOrDid.startsWith("did:")) return handleOrDid;
  const res = await fetch(
    `${PUBLIC_API}/xrpc/com.atproto.identity.resolveHandle?handle=${encodeURIComponent(handleOrDid)}`,
  );
  if (!res.ok) {
    throw new Error(
      `Could not resolve handle "${handleOrDid}": ${res.statusText}`,
    );
  }
  const data = await res.json();
  return data.did as string;
}

async function resolvePDS(did: string): Promise<string> {
  const res = await fetch(`https://plc.directory/${encodeURIComponent(did)}`);
  if (!res.ok) throw new Error(`Could not resolve DID document for "${did}"`);
  const doc = await res.json();
  const service = doc.service?.find(
    (s: { type: string; serviceEndpoint: string }) =>
      s.type === "AtprotoPersonalDataServer",
  );
  if (!service) throw new Error(`No PDS found in DID document for "${did}"`);
  return service.serviceEndpoint as string;
}

async function fetchSite(
  author: string,
  siteSlug: string,
): Promise<SiteWithAuthor> {
  const did = await resolveIdentifier(author);
  const pds = await resolvePDS(did);
  const res = await fetch(
    `${pds}/xrpc/com.atproto.repo.getRecord?repo=${encodeURIComponent(did)}&collection=app.scribe.site&rkey=${encodeURIComponent(siteSlug)}`,
  );
  if (!res.ok) {
    if (res.status === 404) throw new Error(`Site "${siteSlug}" not found`);
    throw new Error(`Failed to fetch site: ${res.statusText}`);
  }
  const { value } = await res.json();
  return {
    title: value.title ?? "",
    url: value.url ?? "",
    urlPrefix: value.urlPrefix ?? "",
    description: value.description,
    splashImageUrl: value.splashImageUrl,
    logoImageUrl: value.logoImageUrl,
    groups: value.groups ?? [],
    articles: value.articles ?? [],
    author: author,
  };
}

export async function loader({ params }: Route.LoaderArgs) {
  const siteData = await fetchSite("anthonycregan.dev", "norobots-blog");
  console.log("siteData OUTPUT:", siteData);
  return siteData;
  // const articleData = fetchArticleData();
  // return articleData;
}

export default function Home({ loaderData }: Route.ComponentProps) {
  console.log("loaderData", loaderData);
  const {
    title,
    url,
    urlPrefix,
    description,
    splashImageUrl,
    logoImageUrl,
    groups,
    articles,
    author,
  } = loaderData;
  return (
    <>
      {groups.map((group) => {
        return (
          <div className={styles.articleGroup}>
            <h1 className={styles.groupHeading}>{group.title}</h1>
            {group?.articles.map((article) => {
              return (
                <ArticleTile
                  key={article.uri}
                  url={article.url ?? ""}
                  title={article.title}
                  synopsis={article.synopsis ?? ""}
                  createdAt={article.createdAt}
                  updatedAt={article.updatedAt}
                  author={author}
                />
              );
            })}
          </div>
        );
      })}
    </>
  );
}
