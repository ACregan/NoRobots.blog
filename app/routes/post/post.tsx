import { Suspense } from "react";
import { Await } from "react-router";
import type { Route } from "./+types/post";
import styles from "./post.module.css";
import { fetchDocumentBySlug, fetchPublication, NotFoundError } from "@skyscribe-sdk/core";
import type { StandardDocument } from "@skyscribe-sdk/core";
import { documentMeta } from "@skyscribe-sdk/react-router-framework";
import { ScribeContent } from "@skyscribe-sdk/react";
import { LikeButton, SubscribeButton, ShareButton } from "@skyscribe-sdk/social";
import "@skyscribe-sdk/styles";
import { SITE_AUTHOR, SITE_URL } from "~/config";
import { contributorCredits, estimateReadTime, formatDate } from "~/utils";
import { Link } from "react-router";
import { fetchWithFastPath } from "~/lib/pdsRetry.server";
import PdsRetrySpinner from "~/components/PdsRetrySpinner/PdsRetrySpinner";
import PdsDownError from "~/components/PdsDownError/PdsDownError";

import {
  LikeIcon,
  ShareIcon,
  SubscribeIcon,
} from "~/components/SvgImage/SvgImage";

export function meta({ loaderData }: Route.MetaArgs) {
  if (!loaderData || loaderData.status !== "ok") {
    return [{ title: "NoRobots.blog" }];
  }
  const { article, site } = loaderData.data;
  return [
    // Includes the site.standard publication and document link tags.
    ...documentMeta(article, site),
  ];
}

export async function loader({ request, params }: Route.LoaderArgs) {
  const { articleSlug } = params;
  if (!articleSlug) throw new Error("Missing route param: articleSlug");
  try {
    return await fetchWithFastPath(async () => {
      const [article, site] = await Promise.all([
        fetchDocumentBySlug(SITE_AUTHOR, SITE_URL, articleSlug, request.signal),
        fetchPublication(SITE_AUTHOR, SITE_URL, request.signal),
      ]);
      return { article, documentUri: article.uri, publicationUri: site.uri, site };
    }, request.signal);
  } catch (error) {
    if (error instanceof NotFoundError) throw new Response("Not Found", { status: 404 });
    throw error;
  }
}

export default function Post({ loaderData }: Route.ComponentProps) {
  if (loaderData.status === "retrying") {
    return (
      <Suspense fallback={<PdsRetrySpinner />}>
        <Await resolve={loaderData.data} errorElement={<PdsDownError />}>
          {(data) => (
            <PostContent
              article={data.article}
              documentUri={data.documentUri}
              publicationUri={data.publicationUri}
            />
          )}
        </Await>
      </Suspense>
    );
  }
  return (
    <PostContent
      article={loaderData.data.article}
      documentUri={loaderData.data.documentUri}
      publicationUri={loaderData.data.publicationUri}
    />
  );
}

function PostContent({
  article,
  documentUri,
  publicationUri,
}: {
  article: StandardDocument;
  documentUri: string;
  publicationUri: string;
}) {
  const {
    title,
    content,
    textContent,
    tags,
    publishedAt,
    contributors,
    coverImageUrl,
  } = article;
  const { author, photographer } = contributorCredits(
    contributors,
    SITE_AUTHOR,
  );

  return (
    <>
      {coverImageUrl && (
        <div className={styles.articleImageContainer}>
          {/* <!-- Blurry full-width bg. This didnt quite work, maybe revisit -->
          <img src={coverImageUrl} className={styles.articleImageBackdrop} />
          */}
          <img
            src={coverImageUrl}
            alt={title}
            className={styles.articleImage}
          />
        </div>
      )}
      <div
        className={`${styles.articleHeaderContainer} ${coverImageUrl && styles.hasSplashImage}`}
      >
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
                    {isSubscribed ? "FOLLOWING" : "FOLLOW"}
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
      <div className={styles.meta}>
        <span className={styles.author}>Written by {author}</span>
        {photographer && (
          <span className={styles.metaSeparator}>
            Photography by {photographer}
          </span>
        )}
        {publishedAt && (
          <span className={styles.metaSeparator}>
            {formatDate(publishedAt)}
          </span>
        )}
        {textContent && (
          <span className={styles.metaSeparator}>
            {`${estimateReadTime(textContent)} Estimated Reading Time`}
          </span>
        )}
      </div>
      {tags && tags.length > 0 && (
        <div className={styles.tags}>
          {tags.map((tag) => (
            <Link key={tag} to={`/tag/${tag}`} className={styles.tag}>
              #{tag}
            </Link>
          ))}
        </div>
      )}
      <ScribeContent html={content} className={styles.postContentContainer} />
    </>
  );
}
