import htmlParser from "html-react-parser";
import type { Route } from "./+types/post";
import styles from "./post.module.css";
import { fetchArticle, resolveDocumentUri } from "@scribe-atp/core";
import { SITE_AUTHOR } from "~/config";

const SITE_DESCRIPTION =
  "Creative writing and news from the front line of the machine resistance. 100% Human-produced content. No Language Models were used in the production of this weblog.";

export function meta({ loaderData }: Route.MetaArgs) {
  return [
    { title: loaderData ? `${loaderData.title} | NoRobots.blog` : "NoRobots.blog" },
    { name: "description", content: loaderData?.description ?? SITE_DESCRIPTION },
    ...(loaderData?.documentUri
      ? [{ tagName: "link", rel: "site.standard.document", href: loaderData.documentUri }]
      : []),
  ];
}

export async function loader({ request, params }: Route.LoaderArgs) {
  const { articleSlug } = params;
  if (!articleSlug) throw new Error("Missing route param: articleSlug");
  const [article, documentUri] = await Promise.all([
    fetchArticle(SITE_AUTHOR, articleSlug, request.signal),
    resolveDocumentUri(SITE_AUTHOR, articleSlug, request.signal),
  ]);
  return { ...article, documentUri };
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
