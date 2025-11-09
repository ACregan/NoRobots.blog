import style from "./ArticleTile.module.css";

type ArticleTileProps = {
  cid: string;
  title: string;
  content: string;
  createdAt: Date;
};
type DateTimeFormatOptions = {
  year: string;
  month: string;
  day: string;
  hour: string;
  minute: string;
  second: string;
  timeZoneName: string;
};

const ArticleTile = ({ cid, title, content, createdAt }: ArticleTileProps) => {
  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
    // hour: "2-digit",
    // minute: "2-digit",
    // second: "2-digit",
    // timeZoneName: "short",
  };
  const dateObject = new Date(createdAt);
  //@ts-ignore
  const customFormatted = new Intl.DateTimeFormat("en-GB", options).format(
    dateObject
  );
  console.log(customFormatted);
  return (
    <a href={`/post/${cid}`} className={style.tileLink}>
      <div>
        <h2>{title}</h2>
        <p className={style.authorName}>By Hugh Mann</p>
        <p className={style.createdDate}>{customFormatted}</p>
        <div className={style.contentPreviewContainer}>{content}</div>
      </div>
    </a>
  );
};

export default ArticleTile;
