import { Link } from "react-router";
import styles from "./GroupHeading.module.css";
import { RightArrow } from "../SvgImage/SvgImage";

interface GroupHeadingProps {
  link?: string;
  children: React.ReactNode;
}

const GroupHeading = ({ link, children }: GroupHeadingProps) => {
  const heading = <h1 className={styles.heading}>{children}</h1>;
  if (!link) return heading;
  return (
    <Link to={`/${link}`} className={styles.link}>
      {heading}
      <div className={styles.arrowContainer}>
        <RightArrow />
      </div>
    </Link>
  );
};

export default GroupHeading;
