import { RightArrow } from "~/components/SvgImage/SvgImage";
import styles from "./ArticleTile.module.css";
import { Link } from "react-router";
import { trackClientAnalyticsEvent, AnalyticsEvent } from "~/hooks/GoogleAnalytics";
import { formatDate } from "~/utils";

type ArticleTileProps = {
  groupSlug: string;
  slug: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt?: string;
  author?: string;
};

const ArticleTile = ({
  groupSlug,
  slug,
  title,
  description,
  createdAt,
  updatedAt,
  author,
}: ArticleTileProps) => {
  return (
    <Link
      to={`/${groupSlug}/${slug}`}
      className={styles.tileLink}
      onClick={() =>
        trackClientAnalyticsEvent(AnalyticsEvent.postLinkClick, { page: slug })
      }
    >
      <div className={styles.tile}>
        <h2 className={styles.articleTitle}>{title}</h2>
        <p className={styles.authorName}>By {author}</p>
        <p className={styles.createdDate}>{formatDate(createdAt)}</p>
        <div className={styles.contentPreviewContainer}>{description}</div>
        <button className={styles.moreButton}>
          <span>READ MORE</span> <RightArrow fill="white" />
        </button>
      </div>
    </Link>
  );
};

export default ArticleTile;
