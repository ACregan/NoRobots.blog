import htmlParser from "html-react-parser";
import type { Route } from "./+types/post";
import styles from "./post.module.css";
import { fetchArticle } from "@scribe-atp/core";
import { SITE_AUTHOR } from "~/config";

const SITE_DESCRIPTION =
  "Creative writing and news from the front line of the machine resistance. 100% Human-produced content. No Language Models were used in the production of this weblog.";

export function meta({ loaderData }: Route.MetaArgs) {
  return [
    { title: loaderData ? `${loaderData.title} | NoRobots.blog` : "NoRobots.blog" },
    { name: "description", content: loaderData?.synopsis ?? SITE_DESCRIPTION },
  ];
}

export async function loader({ request, params }: Route.LoaderArgs) {
  const { articleSlug } = params;
  if (!articleSlug) throw new Error("No article slug provided");
  return fetchArticle(SITE_AUTHOR, articleSlug, request.signal);
}

export default function Post({ loaderData }: Route.ComponentProps) {
  const { title, content } = loaderData;
  return (
    <div>
      <h1 className={styles.articleHeader}>{title}</h1>
      <p className={styles.author}>By {SITE_AUTHOR}</p>
      <div className={styles.postContentContainer}>
        {htmlParser(content)}
      </div>
    </div>
  );
}
