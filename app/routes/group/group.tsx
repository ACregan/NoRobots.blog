import type { Route } from "./+types/group";
import ArticleTile from "../home/ArticleTile/ArticleTile";
import GroupHeading from "~/components/GroupHeading/GroupHeading";
import styles from "./group.module.css";
import { getSite } from "~/atproto";
import { SITE_AUTHOR, SITE_SLUG } from "~/config";

export function meta({ loaderData }: Route.MetaArgs) {
  return [
    { title: loaderData ? `${loaderData.title} | NoRobots.blog` : "NoRobots.blog" },
    { name: "description", content: loaderData?.title },
  ];
}

export async function loader({ params }: Route.LoaderArgs) {
  const { groupSlug } = params;
  const site = await getSite(SITE_AUTHOR, SITE_SLUG);
  const group = site.groups.find((g) => g.slug === groupSlug);
  if (!group) throw new Response(`Group not found`, { status: 404 });
  return group;
}

export default function Group({ loaderData }: Route.ComponentProps) {
  const { title, articles } = loaderData;
  return (
    <div className={styles.groupPage}>
      <GroupHeading>{title}</GroupHeading>
      {articles.map((article) => (
        <ArticleTile
          key={article.uri}
          url={article.url ?? ""}
          title={article.title}
          synopsis={article.synopsis ?? ""}
          createdAt={article.createdAt}
          updatedAt={article.updatedAt}
          author={SITE_AUTHOR}
        />
      ))}
    </div>
  );
}
