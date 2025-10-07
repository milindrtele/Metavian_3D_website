import { useRef, useState, useEffect } from "react";
import styles from "./circleMenu.module.css";

export default function CircleMenu({ onSelect }) {
  return (
    <div className={[styles.button].join(" ")}>
      <div className={[styles.m_logo].join(" ")}></div>
      {/* layer 1 */}
      <div
        className={[styles.arc3, styles.arc, styles.arc_layer_1].join(" ")}
      ></div>
      <div
        className={[styles.arc2, styles.arc, styles.arc_layer_1].join(" ")}
      ></div>
      {/* <div
        className={[styles.arc1, styles.arc, styles.arc_layer_1].join(" ")}
      ></div> */}
      {/* layer 2 */}
      <div
        className={[styles.arc3, styles.arc, styles.arc_layer_2].join(" ")}
      ></div>
      <div
        className={[styles.arc2, styles.arc, styles.arc_layer_2].join(" ")}
      ></div>
      {/* <div
        className={[styles.arc1, styles.arc, styles.arc_layer_2].join(" ")}
      ></div> */}
      {/* layer 3 */}
      <div
        className={[styles.arc3, styles.arc, styles.arc_layer_3].join(" ")}
      ></div>
      <div
        className={[styles.arc2, styles.arc, styles.arc_layer_3].join(" ")}
      ></div>
      {/* <div
        className={[styles.arc1, styles.arc, styles.arc_layer_3].join(" ")}
      ></div> */}
      {/* layer 4 */}
      <div
        className={[styles.arc3, styles.arc, styles.arc_layer_4].join(" ")}
      ></div>
      <div
        className={[styles.arc2, styles.arc, styles.arc_layer_4].join(" ")}
      ></div>
      {/* <div
        className={[styles.arc1, styles.arc, styles.arc_layer_4].join(" ")}
      ></div> */}
    </div>
  );
}
