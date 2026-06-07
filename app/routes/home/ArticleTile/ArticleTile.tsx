import { RightArrow } from "~/components/SvgImage/SvgImage";
import style from "./ArticleTile.module.css";
import { Link } from "react-router";
import { trackClientAnalyticsEvent } from "~/hooks/GoogleAnalytics";

type ArticleTileProps = {
  url: string;
  title: string;
  synopsis: string;
  createdAt: string;
  updatedAt?: string;
  author?: string;
};

const ArticleTile = ({
  url,
  title,
  synopsis,
  createdAt,
  updatedAt,
  author,
}: ArticleTileProps) => {
  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
    // hour: "2-digit",
    // minute: "2-digit",
    // second: "2-digit",
    // timeZoneName: "short",
  } as Intl.DateTimeFormatOptions;
  const dateObject = new Date(createdAt);
  const customFormattedDate = new Intl.DateTimeFormat("en-GB", options).format(
    dateObject,
  );

  // Trim synopsis to add ellipsis
  // const truncatedContent = content.substring(0, 240);
  return (
    <Link
      to={`/article/${url}`}
      className={style.tileLink}
      onClick={() =>
        trackClientAnalyticsEvent(`post_link_click`, { page: url })
      }
    >
      <div className={style.tile}>
        <h2 className={style.articleTitle}>{title}</h2>
        <p className={style.authorName}>By {author}</p>
        <p className={style.createdDate}>{customFormattedDate}</p>
        <div className={style.contentPreviewContainer}>{synopsis}</div>
        <button className={style.moreButton}>
          <span>READ MORE</span> <RightArrow fill="white" />
        </button>
      </div>
    </Link>
  );
};

export default ArticleTile;
