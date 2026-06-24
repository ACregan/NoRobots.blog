import type { Route } from "./+types/group";
import ArticleTile from "../home/ArticleTile/ArticleTile";
import GroupHeading from "~/components/GroupHeading/GroupHeading";
import styles from "./group.module.css";
import { fetchSite } from "@scribe-atp/core";
import type { ArticleRef } from "@scribe-atp/core";
import { SITE_AUTHOR, SITE_SLUG } from "~/config";

export function meta({ loaderData }: Route.MetaArgs) {
  return [
    {
      title: loaderData
        ? `${loaderData.title} | NoRobots.blog`
        : "NoRobots.blog",
    },
    { name: "description", content: loaderData?.title },
  ];
}

export async function loader({ request, params }: Route.LoaderArgs) {
  const { groupSlug } = params;
  const site = await fetchSite(SITE_AUTHOR, SITE_SLUG, request.signal);
  const group = site.groups.find((g) => g.slug === groupSlug);
  if (!group) throw new Response(`Group not found`, { status: 404 });
  return group;
}

export default function Group({ loaderData }: Route.ComponentProps) {
  const { slug, title, articles } = loaderData;
  return (
    <div className={styles.groupPage}>
      <GroupHeading>{title}</GroupHeading>
      <div className={styles.articlesContainer}>
        {articles.map((article: ArticleRef) => (
          <ArticleTile
            key={article.uri}
            groupSlug={slug}
            slug={article.slug ?? ""}
            title={article.title}
            description={article.description ?? ""}
            createdAt={article.createdAt}
            updatedAt={article.updatedAt}
            author={SITE_AUTHOR}
          />
        ))}
      </div>
    </div>
  );
}
