import { Suspense } from "react";
import { Await } from "react-router";
import type { Route } from "./+types/tag";
import ArticleTile from "../home/ArticleTile/ArticleTile";
import GroupHeading from "~/components/GroupHeading/GroupHeading";
import styles from "./tag.module.css";
import { fetchSite, NotFoundError } from "@scribe-atp/core";
import type { ArticleRef, Site } from "@scribe-atp/core";
import { SITE_AUTHOR, SITE_URL } from "~/config";
import { contributorCredits } from "~/utils";
import { fetchWithFastPath } from "~/lib/pdsRetry.server";
import PdsRetrySpinner from "~/components/PdsRetrySpinner/PdsRetrySpinner";
import PdsDownError from "~/components/PdsDownError/PdsDownError";

interface TagMatch {
  article: ArticleRef;
  groupSlug: string;
}

export function meta({ params }: Route.MetaArgs) {
  return [
    { title: `#${params.tag} | NoRobots.blog` },
    { name: "description", content: `Articles tagged with #${params.tag}` },
  ];
}

function findTagMatches(site: Site, tag: string | undefined): TagMatch[] {
  const matches: TagMatch[] = [];
  for (const group of site.groups) {
    for (const article of group.articles) {
      if (article.tags?.includes(tag ?? "")) {
        matches.push({ article, groupSlug: group.slug });
      }
    }
  }
  if (matches.length === 0) throw new NotFoundError(`Tag not found: ${tag}`);
  return matches;
}

export async function loader({ request, params }: Route.LoaderArgs) {
  const { tag } = params;
  const result = await fetchWithFastPath(
    () => fetchSite(SITE_AUTHOR, SITE_URL, request.signal),
    request.signal,
  );
  if (result.status === "ok") {
    try {
      return { status: "ok" as const, data: findTagMatches(result.data, tag) };
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw new Response("Tag not found", { status: 404 });
      }
      throw error;
    }
  }
  return {
    status: "retrying" as const,
    data: result.data.then((site) => findTagMatches(site, tag)),
  };
}

export default function Tag({ loaderData, params }: Route.ComponentProps) {
  if (loaderData.status === "retrying") {
    return (
      <Suspense fallback={<PdsRetrySpinner />}>
        <Await resolve={loaderData.data} errorElement={<PdsDownError />}>
          {(matches) => <TagContent tag={params.tag} matches={matches} />}
        </Await>
      </Suspense>
    );
  }
  return <TagContent tag={params.tag} matches={loaderData.data} />;
}

function TagContent({ tag, matches }: { tag: string; matches: TagMatch[] }) {
  return (
    <div className={styles.tagPage}>
      <GroupHeading>#{tag}</GroupHeading>
      <div className={styles.articlesContainer}>
        {matches.map(({ article, groupSlug }) => {
          const { author, photographer } = contributorCredits(
            article.contributors,
            SITE_AUTHOR,
          );
          return (
            <ArticleTile
              key={article.uri}
              size={1}
              groupSlug={groupSlug}
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
