import type { Route } from "./+types/home";
import ArticleTile from "./ArticleTile/ArticleTile";
import GroupHeading from "~/components/GroupHeading/GroupHeading";
import styles from "./home.module.css";
import { createSiteLoader } from "@scribe-atp/react-router-framework";
import type { ArticleRef, SiteGroup } from "@scribe-atp/core";
import { SITE_AUTHOR, SITE_URL } from "~/config";

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

export const loader = createSiteLoader(SITE_AUTHOR, SITE_URL);

export default function Home({ loaderData }: Route.ComponentProps) {
  const { groups } = loaderData;
  return (
    <>
      {groups.map((group: SiteGroup) => {
        if (group.articles.length > 0) {
          return (
            <div key={group.slug} className={styles.articleGroup}>
              <GroupHeading link={group.slug}>{group.title}</GroupHeading>
              <div className={styles.articlesContainer}>
                {group.articles.map((article: ArticleRef) => (
                  <ArticleTile
                    key={article.uri}
                    groupSlug={group.slug}
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
      })}
    </>
  );
}
