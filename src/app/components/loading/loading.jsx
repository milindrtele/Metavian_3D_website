import { useEffect, useState, useRef, useContext } from "react";
import { loadingContext } from "../contexts/loadingContext.jsx";
import styles from "./loading.module.css";

export default function Loading(props) {
  const { loadedPercentage, setLoadedPercentage } = useContext(loadingContext);
  const loading_barRef = useRef(null);
  useEffect(() => {
    loading_barRef.current.style.width = `${loadedPercentage}%`;
  }, [loadedPercentage]);
  return (
    <div className={[styles.abc].join(" ")}>
      <div className={[styles.loading_screen].join(" ")}>
        {/* <div className={[styles.loading_screen_background].join(" ")}></div> */}
        <div className={[styles.loading_screen_content].join(" ")}>
          <div className={[styles.loader_box].join(" ")}>
            <div className={[styles.loader].join(" ")}></div>
          </div>
          <div className={[styles.loading_bar_container].join(" ")}>
            <div
              ref={loading_barRef}
              className={[styles.loading_bar].join(" ")}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}
