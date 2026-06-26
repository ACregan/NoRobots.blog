import htmlParser from "html-react-parser";
import type { Route } from "./+types/post";
import styles from "./post.module.css";
import { fetchArticleBySlug, fetchSite } from "@scribe-atp/core";
import { LikeButton, SubscribeButton } from "@scribe-atp/social";
import { SITE_AUTHOR, SITE_URL } from "~/config";

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
  const [{ article, uri: documentUri }, site] = await Promise.all([
    fetchArticleBySlug(SITE_AUTHOR, SITE_URL, articleSlug, request.signal),
    fetchSite(SITE_AUTHOR, SITE_URL, request.signal),
  ]);
  return { ...article, documentUri, publicationUri: site.uri };
}

export default function Post({ loaderData }: Route.ComponentProps) {
  const { title, content, documentUri, publicationUri } = loaderData;
  return (
    <div>
      <h1 className={styles.articleHeader}>{title}</h1>
      <p className={styles.author}>By {SITE_AUTHOR}</p>
      <div className={styles.postContentContainer}>
        {htmlParser(content)}
      </div>
      {documentUri && (
        <LikeButton documentUri={documentUri} title={title} />
      )}
      {publicationUri && (
        <SubscribeButton publicationUri={publicationUri} title="NoRobots" />
      )}
    </div>
  );
}
