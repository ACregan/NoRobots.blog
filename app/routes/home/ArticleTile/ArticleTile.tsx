import { useState } from "react";
import { NoRobotsLogo, RightArrow } from "~/components/SvgImage/SvgImage";
import styles from "./ArticleTile.module.css";
import { Link } from "react-router";
import { formatDate } from "~/utils";

const ImageFallback = () => {
  return (
    <div className={styles.imageFallback}>
      <NoRobotsLogo />
    </div>
  );
};

const TileImage = ({ src }: { src?: string }) => {
  const [failed, setFailed] = useState(false);

  if (!src || failed) return <ImageFallback />;

  return <img src={src} onError={() => setFailed(true)} />;
};

type ArticleTileProps = {
  size: number;
  groupSlug: string;
  slug: string;
  splashImage?: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt?: string;
  author?: string;
  photographer?: string;
};

const ArticleTileOne = ({
  size,
  groupSlug,
  slug,
  splashImage,
  title,
  description,
  createdAt,
  updatedAt,
  author,
  photographer,
}: ArticleTileProps) => {
  return (
    <div className={styles.tileOne}>
      <div className={styles.splashImageContainer}>
        <TileImage src={splashImage} />
      </div>
      <div className={styles.contentContainer}>
        <div className={styles.textWrapper}>
          <h2 className={styles.articleTitle}>{title}</h2>
          <p className={styles.authorName}>By {author}</p>
          {photographer && (
            <p className={styles.photographerName}>
              Photography by {photographer}
            </p>
          )}
          <p className={styles.createdDate}>{formatDate(createdAt)}</p>
          <div className={styles.contentPreviewContainer}>{description}</div>
        </div>
        <div className={styles.buttonWrapper}>
          <button className={styles.moreButton}>
            <span>READ MORE</span> <RightArrow fill="white" />
          </button>
        </div>
      </div>
    </div>
  );
};

const ArticleTileTwo = ({
  size,
  groupSlug,
  slug,
  splashImage,
  title,
  description,
  createdAt,
  updatedAt,
  author,
  photographer,
}: ArticleTileProps) => {
  return (
    <div className={styles.tileTwo}>
      <div className={styles.imageHeadingContainer}>
        <TileImage src={splashImage} />
      </div>
      <div className={styles.contentContainer}>
        <div className={styles.textWrapper}>
          <h2 className={styles.articleTitle}>{title}</h2>
          <p className={styles.authorName}>By {author}</p>
          {photographer && (
            <p className={styles.photographerName}>
              Photography by {photographer}
            </p>
          )}
          <p className={styles.createdDate}>{formatDate(createdAt)}</p>
          <div className={styles.contentPreviewContainer}>{description}</div>
        </div>
        <div className={styles.buttonWrapper}>
          <button className={styles.moreButton}>
            <span>READ MORE</span> <RightArrow fill="white" />
          </button>
        </div>
      </div>
    </div>
  );
};

const ArticleTileThree = ({
  size,
  groupSlug,
  slug,
  splashImage,
  title,
  description,
  createdAt,
  updatedAt,
  author,
  photographer,
}: ArticleTileProps) => {
  return (
    <div className={styles.tileThree}>
      <div className={styles.imageHeadingContainer}>
        <TileImage src={splashImage} />
      </div>
      <div className={styles.contentContainer}>
        <div className={styles.textWrapper}>
          <h2 className={styles.articleTitle}>{title}</h2>
          <p className={styles.authorName}>By {author}</p>
          {photographer && (
            <p className={styles.photographerName}>
              Photography by {photographer}
            </p>
          )}
          <p className={styles.createdDate}>{formatDate(createdAt)}</p>
          <div className={styles.contentPreviewContainer}>{description}</div>
        </div>
        <div className={styles.buttonWrapper}>
          <button className={styles.moreButton}>
            <span>READ MORE</span> <RightArrow fill="white" />
          </button>
        </div>
      </div>
    </div>
  );
};

const ArticleTile = (props: ArticleTileProps) => {
  const { groupSlug, slug, size } = props;
  const Tile =
    size === 1
      ? ArticleTileOne
      : size === 2
        ? ArticleTileTwo
        : ArticleTileThree;

  return (
    <Link to={`/${groupSlug}/${slug}`} className={styles.tileLink}>
      <Tile {...props} />
    </Link>
  );
};

export default ArticleTile;
