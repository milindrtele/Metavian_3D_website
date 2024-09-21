import { useRef, useState, useEffect } from "react";
import styles from "./hamburgerMenu.module.css";

function HamburgerMenu(props) {
  let [menuIsVisible, setMenuIsVisible] = useState(false);
  const menuParentRef = useRef(null);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    menuParentRef.current = document.getElementById("menu-parent");
    menuRef.current = document.getElementById("menu");
    buttonRef.current = document.getElementById("menuButton");
  }, []);

  useEffect(() => {
    if (!menuIsVisible) {
      menuRef.current.style.transform = "translateX(-100%)";
      buttonRef.current.style.backgroundImage = "url(icons/bars-solid.svg)"; //topIcon01Src;
    } else {
      menuRef.current.style.transform = "translateX(0%)";
      buttonRef.current.style.backgroundImage =
        "url(icons/circle-xmark-regular.svg)"; //topIcon02Src;
    }
  }, [menuIsVisible]);

  function handleClick(e) {
    let selectedMenu = e.currentTarget.getAttribute("name");
    props.selectedItem(selectedMenu);
  }

  return (
    <div id="menu_parent">
      <div
        className={styles.menu_close_button}
        id="menuButton"
        onClick={() => {
          setMenuIsVisible(!menuIsVisible);
        }}
      ></div>
      <div className={[styles.menu_container].join(" ")} id="menu">
        <div className={styles.menu}>
          <div
            className={[styles.menu_item, styles.menu_0].join(" ")}
            onClick={handleClick}
            name="home"
          >
            {/* <div className={[styles.menu_logo, styles.i_0].join(" ")}></div> */}
            <div className={styles.menu_text}>Home</div>
          </div>
          <div className={styles.line_in_menu}></div>
          <div
            className={[styles.menu_item, styles.menu_1].join(" ")}
            onClick={handleClick}
            name="Car Configurator"
          >
            {/* <div className={[styles.menu_logo, styles.i_1].join(" ")}></div> */}
            <div className={styles.menu_text}>Car Configurator</div>
          </div>
          <div
            className={[styles.menu_item, styles.menu_2].join(" ")}
            onClick={handleClick}
            name="MetaRealty"
          >
            {/* <div className={[styles.menu_logo, styles.i_2].join(" ")}></div> */}
            <div className={styles.menu_text}>MetaRealty</div>
          </div>
          <div
            className={[styles.menu_item, styles.menu_3].join(" ")}
            onClick={handleClick}
            name="Virtual Production"
          >
            {/* <div className={[styles.menu_logo, styles.i_3].join(" ")}></div> */}
            <div className={styles.menu_text}>Virtual Production</div>
          </div>
          <div
            className={[styles.menu_item, styles.menu_4].join(" ")}
            onClick={handleClick}
            name="Edulab"
          >
            {/* <div className={[styles.menu_logo, styles.i_4].join(" ")}></div> */}
            <div className={styles.menu_text}>Edulab</div>
          </div>
          <div
            className={[styles.menu_item, styles.menu_5].join(" ")}
            onClick={handleClick}
            name="Fashion-IX"
          >
            {/* <div className={[styles.menu_logo, styles.i_5].join(" ")}></div> */}
            <div className={styles.menu_text}>Fashion-IX</div>
          </div>
          <div
            className={[styles.menu_item, styles.menu_6].join(" ")}
            onClick={handleClick}
            name="Virtual Mart"
          >
            {/* <div className={[styles.menu_logo, styles.i_6].join(" ")}></div> */}
            <div className={styles.menu_text}>Virtual Mart</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HamburgerMenu;
