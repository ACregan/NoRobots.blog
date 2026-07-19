import type { Route } from "./+types/home";
import ArticleTile from "./ArticleTile/ArticleTile";
import GroupHeading from "~/components/GroupHeading/GroupHeading";
import styles from "./home.module.css";
import { createSiteLoader } from "@scribe-atp/react-router-framework";
import type { ArticleRef, SiteGroup } from "@scribe-atp/core";
import { SITE_AUTHOR, SITE_URL } from "~/config";
import { contributorCredits } from "~/utils";

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
