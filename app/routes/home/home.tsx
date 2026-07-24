import { Suspense } from "react";
import { Await } from "react-router";
import type { Route } from "./+types/home";
import ArticleTile from "./ArticleTile/ArticleTile";
import GroupHeading from "~/components/GroupHeading/GroupHeading";
import styles from "./home.module.css";
import { fetchSite, buildSiteUrl, generateSiteJsonLd } from "@scribe-atp/core";
import type { ArticleRef, Site, SiteGroup } from "@scribe-atp/core";
import { SITE_AUTHOR, SITE_URL } from "~/config";
import { contributorCredits } from "~/utils";
import { fetchWithFastPath } from "~/lib/pdsRetry.server";
import PdsRetrySpinner from "~/components/PdsRetrySpinner/PdsRetrySpinner";
import PdsDownError from "~/components/PdsDownError/PdsDownError";

export function meta({ loaderData }: Route.MetaArgs) {
  const site = loaderData?.status === "ok" ? loaderData.data : undefined;
  return [
    { title: "NoRobots.blog" },
    {
      name: "description",
      content:
        "Creative writing and news from the front line of the machine resistance. 100% Human-produced content. No Language Models were used in the production of this weblog.",
    },
    // Keep the hand-written title/description above (deliberately more
    // brand-voiced than the site record's) — just add the structured-data
    // pieces that were missing entirely: canonical + WebSite JSON-LD.
    ...(site
      ? [
          { tagName: "link", rel: "canonical", href: buildSiteUrl(site) },
          { "script:ld+json": generateSiteJsonLd(site) },
        ]
      : []),
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  return fetchWithFastPath(
    () => fetchSite(SITE_AUTHOR, SITE_URL, request.signal),
    request.signal,
  );
}

export default function Home({ loaderData }: Route.ComponentProps) {
  if (loaderData.status === "retrying") {
    return (
      <Suspense fallback={<PdsRetrySpinner />}>
        <Await resolve={loaderData.data} errorElement={<PdsDownError />}>
          {(site) => <HomeContent site={site} />}
        </Await>
      </Suspense>
    );
  }
  return <HomeContent site={loaderData.data} />;
}

function HomeContent({ site }: { site: Site }) {
  const { groups } = site;
  return (
    <>
      {groups.map((group: SiteGroup) => {
        if (group.articles.length > 0) {
          return (
            <div key={group.slug} className={styles.articleGroup}>
              <GroupHeading link={group.slug}>{group.title}</GroupHeading>
              <div className={styles.articlesContainer}>
                {group.articles.map((article: ArticleRef, index: number) => {
                  const sizeLookup =
                    group.articles.length <= 2 ? [1, 1] : [1, 2, 2];

                  const { author, photographer } = contributorCredits(
                    article.contributors,
                    SITE_AUTHOR,
                  );

                  return (
                    <ArticleTile
                      key={article.uri}
                      size={sizeLookup[index] ?? 3}
                      groupSlug={group.slug}
                      slug={article.slug ?? ""}
                      splashImage={article.splashImageUrl ?? undefined}
                      title={article.title}
                      description={article.description ?? ""}
                      createdAt={article.createdAt}
                      updatedAt={article.updatedAt}
                      author={author}
                      photographer={photographer}
                    />
                  );
                })}
              </div>
            </div>
          );
        }
      })}
    </>
  );
}
