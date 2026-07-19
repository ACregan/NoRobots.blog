import type { Route } from "./+types/tag";
import ArticleTile from "../home/ArticleTile/ArticleTile";
import GroupHeading from "~/components/GroupHeading/GroupHeading";
import styles from "./tag.module.css";
import { fetchSite } from "@scribe-atp/core";
import type { ArticleRef } from "@scribe-atp/core";
import { SITE_AUTHOR, SITE_URL } from "~/config";
import { contributorCredits } from "~/utils";

export function meta({ params }: Route.MetaArgs) {
  return [
    { title: `#${params.tag} | NoRobots.blog` },
    { name: "description", content: `Articles tagged with #${params.tag}` },
  ];
}

export async function loader({ request, params }: Route.LoaderArgs) {
  const { tag } = params;
  const site = await fetchSite(SITE_AUTHOR, SITE_URL, request.signal);
  const matches: Array<{ article: ArticleRef; groupSlug: string }> = [];
  for (const group of site.groups) {
    for (const article of group.articles) {
      if (article.tags?.includes(tag)) {
        matches.push({ article, groupSlug: group.slug });
      }
    }
  }
  if (matches.length === 0) throw new Response("Tag not found", { status: 404 });
  return { tag, matches };
}

export default function Tag({ loaderData }: Route.ComponentProps) {
  const { tag, matches } = loaderData;
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
