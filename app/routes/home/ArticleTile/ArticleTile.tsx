import { RightArrow } from "~/components/SvgImage/SvgImage";
import styles from "./ArticleTile.module.css";
import { Link } from "react-router";
import { trackClientAnalyticsEvent, AnalyticsEvent } from "~/hooks/GoogleAnalytics";
import { formatDate } from "~/utils";

type ArticleTileProps = {
  groupSlug: string;
  url: string;
  title: string;
  synopsis: string;
  createdAt: string;
  updatedAt?: string;
  author?: string;
};

const ArticleTile = ({
  groupSlug,
  url,
  title,
  synopsis,
  createdAt,
  updatedAt,
  author,
}: ArticleTileProps) => {
  return (
    <Link
      to={`/${groupSlug}/${url}`}
      className={styles.tileLink}
      onClick={() =>
        trackClientAnalyticsEvent(AnalyticsEvent.postLinkClick, { page: url })
      }
    >
      <div className={styles.tile}>
        <h2 className={styles.articleTitle}>{title}</h2>
        <p className={styles.authorName}>By {author}</p>
        <p className={styles.createdDate}>{formatDate(createdAt)}</p>
        <div className={styles.contentPreviewContainer}>{synopsis}</div>
        <button className={styles.moreButton}>
          <span>READ MORE</span> <RightArrow fill="white" />
        </button>
      </div>
    </Link>
  );
};

export default ArticleTile;
