import { LeftArrow } from "../SvgImage/SvgImage";
import styles from "./FourOhFour.module.css";

const FourOhFour = () => {
  return (
    <div className={styles.container}>
      <div className={styles.fourOhFourContainer}>
        <h1>404</h1>
        <h3>PAGE NOT FOUND</h3>
      </div>
      <p>The requested page could not be found.</p>
      <div className={styles.buttonWrapper}>
        <a href="/">
          <button className={styles.backButton}>
            <LeftArrow fill="white" />
            <span>RETURN TO HOMEPAGE</span>
          </button>
        </a>
      </div>
    </div>
  );
};

export default FourOhFour;
