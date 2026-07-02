import type { Route } from "./+types/post";
import styles from "./post.module.css";
import { fetchArticleBySlug, fetchSite } from "@scribe-atp/core";
import { articleMeta } from "@scribe-atp/react-router-framework";
import { ScribeContent } from "@scribe-atp/react";
import { LikeButton, SubscribeButton, ShareButton } from "@scribe-atp/social";
import "@scribe-atp/styles";
import { SITE_AUTHOR, SITE_URL } from "~/config";
import {
  LikeIcon,
  ShareIcon,
  SubscribeIcon,
} from "~/components/SvgImage/SvgImage";

export function meta({ loaderData }: Route.MetaArgs) {
  if (!loaderData) return [{ title: "NoRobots.blog" }];
  return [
    ...articleMeta(loaderData.article, loaderData.site),
    { title: `${loaderData.article.title} | NoRobots.blog` },
    ...(loaderData.documentUri
      ? [
          {
            tagName: "link",
            rel: "site.standard.document",
            href: loaderData.documentUri,
          },
        ]
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
      <div className={styles.articleHeaderContainer}>
        <h1 className={styles.articleHeader}>{title}</h1>
        <div className={styles.socialButtonsContainer}>
          {documentUri && (
            <LikeButton
              documentUri={documentUri}
              publicationUri={publicationUri}
              title={title}
            >
              {(isLiked) => (
                <>
                  <LikeIcon
                    fill={isLiked ? "var(--socialIconColour, black)" : "none"}
                    stroke={"var(--socialIconColour, black)"}
                    className={
                      isLiked ? styles.socialIcon_active : styles.socialIcon
                    }
                  />
                  <span className={styles.socialLabel}>
                    {isLiked ? "LIKED" : "LIKE"}
                  </span>
                </>
              )}
            </LikeButton>
          )}
          {publicationUri && (
            <SubscribeButton publicationUri={publicationUri} title="NoRobots">
              {(isSubscribed) => (
                <>
                  <SubscribeIcon
                    fill={
                      isSubscribed ? "var(--socialIconColour, black)" : "none"
                    }
                    stroke={"var(--socialIconColour, black)"}
                    className={
                      isSubscribed
                        ? styles.socialIcon_active
                        : styles.socialIcon
                    }
                  />
                  <span className={styles.socialLabel}>
                    {isSubscribed ? "SUBSCRIBED" : "SUBSCRIBE"}
                  </span>
                </>
              )}
            </SubscribeButton>
          )}
          {documentUri && publicationUri && (
            <ShareButton
              documentUri={documentUri}
              publicationUri={publicationUri}
              title={title}
            >
              {(isShared) => (
                <>
                  <ShareIcon
                    fill={isShared ? "var(--socialIconColour, black)" : "none"}
                    stroke={"var(--socialIconColour, black)"}
                    className={
                      isShared ? styles.socialIcon_active : styles.socialIcon
                    }
                  />
                  <span className={styles.socialLabel}>
                    {isShared ? "SHARED" : "SHARE"}
                  </span>
                </>
              )}
            </ShareButton>
          )}
        </div>
      </div>
      <p className={styles.author}>By {SITE_AUTHOR}</p>
      <ScribeContent html={content} className={styles.postContentContainer} />
    </div>
  );
}
