import type { Route } from "./+types/post";
import styles from "./post.module.css";
import { fetchArticleBySlug, fetchSite } from "@scribe-atp/core";
import { articleMeta } from "@scribe-atp/react-router-framework";
import { ScribeContent } from "@scribe-atp/react";
import { LikeButton, SubscribeButton, ShareButton } from "@scribe-atp/social";
import "@scribe-atp/styles";
import { SITE_AUTHOR, SITE_URL } from "~/config";

export function meta({ loaderData }: Route.MetaArgs) {
  if (!loaderData) return [{ title: "NoRobots.blog" }];
  return [
    ...articleMeta(loaderData.article, loaderData.site),
    { title: `${loaderData.article.title} | NoRobots.blog` },
    ...(loaderData.documentUri
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
  return { article, documentUri, publicationUri: site.uri, site };
}

export default function Post({ loaderData }: Route.ComponentProps) {
  const { article, documentUri, publicationUri } = loaderData;
  const { title, content } = article;
  return (
    <div>
      <h1 className={styles.articleHeader}>{title}</h1>
      <p className={styles.author}>By {SITE_AUTHOR}</p>
      <ScribeContent html={content} className={styles.postContentContainer} />
      {documentUri && (
        <LikeButton documentUri={documentUri} publicationUri={publicationUri} title={title} />
      )}
      {publicationUri && (
        <SubscribeButton publicationUri={publicationUri} title="NoRobots" />
      )}
      {documentUri && publicationUri && (
        <ShareButton documentUri={documentUri} publicationUri={publicationUri} title={title} />
      )}
    </div>
  );
}
