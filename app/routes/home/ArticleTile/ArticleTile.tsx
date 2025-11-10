import { RightArrow } from "~/components/SvgImage/SvgImage";
import style from "./ArticleTile.module.css";

type ArticleTileProps = {
  cid: string;
  title: string;
  content: string;
  createdAt: Date;
  author?: string;
};

const ArticleTile = ({
  cid,
  title,
  content,
  createdAt,
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
    dateObject
  );

  // Trim content to add ellipsis
  const truncatedContent = content.substring(0, 240);
  return (
    <a href={`/post/${cid}`} className={style.tileLink}>
      <div className={style.tile}>
        <h2 className={style.articleTitle}>{title}</h2>
        <p className={style.authorName}>By {author}</p>
        <p className={style.createdDate}>{customFormattedDate}</p>
        <div
          className={style.contentPreviewContainer}
        >{`${truncatedContent} ...`}</div>
        <button className={style.moreButton}>
          <span>READ MORE</span> <RightArrow fill="white" />
        </button>
      </div>
    </a>
  );
};

export default ArticleTile;
