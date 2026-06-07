import { marked } from "marked";
import htmlParser from "html-react-parser";
import type { Route } from "./+types/post";
import styles from "./post.module.css";
import { getArticle } from "~/atproto";
import { SITE_AUTHOR } from "~/config";

const SITE_DESCRIPTION =
  "Creative writing and news from the front line of the machine resistance. 100% Human-produced content. No Language Models were used in the production of this weblog.";

export function meta({ loaderData }: Route.MetaArgs) {
  return [
    { title: loaderData ? `${loaderData.title} | NoRobots.blog` : "NoRobots.blog" },
    { name: "description", content: loaderData?.synopsis ?? SITE_DESCRIPTION },
  ];
}

export async function loader({ params }: Route.LoaderArgs) {
  const { articleId } = params;
  if (!articleId) throw new Error("No article ID provided");
  return getArticle(SITE_AUTHOR, articleId);
}

export default function Post({ loaderData }: Route.ComponentProps) {
  const { title, content } = loaderData;
  const markdownConverted = marked.parse(
    content
      .replace(/^[​‌‍‎‏﻿]/, "")
      .replaceAll(`\\n`, ""),
  ) as string;
  const markdownConvertedAndParsed = htmlParser(markdownConverted);
  return (
    <div>
      <h1 className={styles.articleHeader}>{title}</h1>
      <p className={styles.author}>By {SITE_AUTHOR}</p>
      <div className={styles.postContentContainer}>
        {markdownConvertedAndParsed}
      </div>
    </div>
  );
}
