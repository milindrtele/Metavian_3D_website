import { useRef, useState, useEffect } from "react";
import styles from "./circleMenu.module.css";

export default function CircleMenu(props) {
  function handleClickTopLevelMenu(e) {
    const selectedMenu = e.currentTarget.getAttribute("name");
    props.handleClickTopLevelMenuProp(selectedMenu);
  }

  return (
    <div className={[styles.button].join(" ")}>
      <div
        className={[styles.m_logo].join(" ")}
        onClick={handleClickTopLevelMenu}
        name="Menu Item 1"
      ></div>
      <div className={[styles.arc_container].join(" ")}>
        {/* layer 1 */}
        <div
          className={[styles.arc3, styles.arc, styles.arc_layer_1].join(" ")}
          onClick={handleClickTopLevelMenu}
          name="Menu Item 1"
        >
          <div className={[styles.text_container].join(" ")}>
            <h1>Products</h1>
          </div>
        </div>
        {/* <div
          className={[styles.arc2, styles.arc, styles.arc_layer_1].join(" ")}
        ></div> */}
        {/* <div
        className={[styles.arc1, styles.arc, styles.arc_layer_1].join(" ")}
      ></div> */}
        {/* layer 2 */}
        <div
          className={[styles.arc3, styles.arc, styles.arc_layer_2].join(" ")}
          onClick={handleClickTopLevelMenu}
          name="Menu Item 2"
        >
          <div className={[styles.text_container].join(" ")}>
            <h1>Use Cases</h1>
          </div>
        </div>
        {/* <div
          className={[styles.arc2, styles.arc, styles.arc_layer_2].join(" ")}
        ></div> */}
        {/* <div
        className={[styles.arc1, styles.arc, styles.arc_layer_2].join(" ")}
      ></div> */}
        {/* layer 3 */}
        <div
          className={[styles.arc3, styles.arc, styles.arc_layer_3].join(" ")}
          onClick={handleClickTopLevelMenu}
          name="Menu Item 3"
        >
          <div className={[styles.text_container].join(" ")}>
            <h1>Contact Us</h1>
          </div>
        </div>
        {/* <div
          className={[styles.arc2, styles.arc, styles.arc_layer_3].join(" ")}
        ></div> */}
        {/* <div
        className={[styles.arc1, styles.arc, styles.arc_layer_3].join(" ")}
      ></div> */}
        {/* layer 4 */}
        <div
          className={[styles.arc3, styles.arc, styles.arc_layer_4].join(" ")}
          onClick={handleClickTopLevelMenu}
          name="Menu Item 4"
        >
          <div className={[styles.text_container].join(" ")}>
            <h1>Our Team</h1>
          </div>
        </div>
        {/* <div
          className={[styles.arc2, styles.arc, styles.arc_layer_4].join(" ")}
        ></div> */}
        {/* <div
        className={[styles.arc1, styles.arc, styles.arc_layer_4].join(" ")}
      ></div> */}
      </div>
    </div>
  );
}
