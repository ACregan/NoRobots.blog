import { Suspense } from "react";
import { Await } from "react-router";
import type { Route } from "./+types/group";
import ArticleTile from "../home/ArticleTile/ArticleTile";
import GroupHeading from "~/components/GroupHeading/GroupHeading";
import styles from "./group.module.css";
import { fetchSite, NotFoundError } from "@scribe-atp/core";
import type { ArticleRef, Site, SiteGroup } from "@scribe-atp/core";
import { SITE_AUTHOR, SITE_URL } from "~/config";
import { contributorCredits } from "~/utils";
import { fetchWithFastPath } from "~/lib/pdsRetry.server";
import PdsRetrySpinner from "~/components/PdsRetrySpinner/PdsRetrySpinner";
import PdsDownError from "~/components/PdsDownError/PdsDownError";

export function meta({ loaderData }: Route.MetaArgs) {
  const group = loaderData?.status === "ok" ? loaderData.data : undefined;
  return [
    {
      title: group ? `${group.title} | NoRobots.blog` : "NoRobots.blog",
    },
    { name: "description", content: group?.title },
  ];
}

function findGroup(site: Site, groupSlug: string | undefined): SiteGroup {
  const group = site.groups.find((g) => g.slug === groupSlug);
  if (!group) throw new NotFoundError(`Group not found: ${groupSlug}`);
  return group;
}

export async function loader({ request, params }: Route.LoaderArgs) {
  const { groupSlug } = params;
  const result = await fetchWithFastPath(
    () => fetchSite(SITE_AUTHOR, SITE_URL, request.signal),
    request.signal,
  );
  if (result.status === "ok") {
    try {
      return { status: "ok" as const, data: findGroup(result.data, groupSlug) };
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw new Response("Group not found", { status: 404 });
      }
      throw error;
    }
  }
  return {
    status: "retrying" as const,
    data: result.data.then((site) => findGroup(site, groupSlug)),
  };
}

export default function Group({ loaderData }: Route.ComponentProps) {
  if (loaderData.status === "retrying") {
    return (
      <Suspense fallback={<PdsRetrySpinner />}>
        <Await resolve={loaderData.data} errorElement={<PdsDownError />}>
          {(group) => <GroupContent group={group} />}
        </Await>
      </Suspense>
    );
  }
  return <GroupContent group={loaderData.data} />;
}

function GroupContent({ group }: { group: SiteGroup }) {
  const { slug, title, articles } = group;
  return (
    <div className={styles.groupPage}>
      <GroupHeading>{title}</GroupHeading>
      <div className={styles.articlesContainer}>
        {articles.map((article: ArticleRef) => {
          const { author, photographer } = contributorCredits(
            article.contributors,
            SITE_AUTHOR,
          );
          return (
            <ArticleTile
              key={article.uri}
              size={2}
              groupSlug={slug}
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
