import { useState, useRef, useEffect, useContext } from "react";
import styles from "./sceneInfo.module.css";
import { currentSceneContext } from "../contexts/currentSceneContext.jsx";

export default function SceneInfo(props) {
  const { currentSceneInfo, setCurrentSceneInfo } =
    useContext(currentSceneContext);
  return (
    <div>
      <div className={[styles.sceneInfo_container].join(" ")}>
        <div className={[styles.info_container].join(" ")}>
          <p>Current Scene Name</p>
          <p>Current Object Name</p>
        </div>
        <div className={[styles.help_container].join(" ")}>
          <div className={[styles.icon].join(" ")}></div>
        </div>
      </div>
    </div>
  );
}
