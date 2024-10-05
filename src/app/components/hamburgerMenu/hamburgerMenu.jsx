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
      buttonRef.current.style.transform = "translateX(0%)";
    } else {
      menuRef.current.style.transform = "translateX(0%)";
      buttonRef.current.style.backgroundImage =
        "url(icons/chevron-left-solid.svg)"; //topIcon02Src;
      buttonRef.current.style.transform = "translateX(600%)";
    }
  }, [menuIsVisible]);

  function handleClickTopLevelMenu(e) {
    const selectedMenu = e.currentTarget.getAttribute("name");
    props.handleClickTopLevelMenuProp(selectedMenu);
  }

  function handleClickSubMenu1(e) {
    const selectedMenu = e.currentTarget.getAttribute("name");
    props.handleClickTopLevelMenuProp("Menu Item 1");
    props.selectedItemSubMenu1(selectedMenu);
  }

  function handleClickSubMenu2(e) {
    const selectedMenu = e.currentTarget.getAttribute("name");
    props.handleClickTopLevelMenuProp("Menu Item 2");
    props.selectedItemSubMenu2(selectedMenu);
  }

  function handleClickSubMenu3(e) {
    const selectedMenu = e.currentTarget.getAttribute("name");
    props.handleClickTopLevelMenuProp("Menu Item 3");
    props.selectedItemSubMenu3(selectedMenu);
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
          {/* Home (top-level menu item) */}
          <div
            className={[styles.menu_item, styles.menu_0].join(" ")}
            onClick={handleClickTopLevelMenu}
            name="home"
          >
            <div className={styles.menu_text}>Home</div>
          </div>

          <div className={styles.line_in_menu}></div>

          {/* Menu Item 1 (main menu with submenu) */}
          <div
            className={[
              styles.menu_item,
              styles.menu_dropdown,
              styles.menu_item_1,
            ].join(" ")}
            onClick={handleClickTopLevelMenu}
            name="Menu Item 1"
          >
            <div className={styles.menu_text}>Menu Item 1</div>
          </div>
          <div className={[styles.submenu, styles.submenu_1].join(" ")}>
            <div
              className={[styles.menu_item, styles.menu_1].join(" ")}
              onClick={handleClickSubMenu1}
              name="Car Configurator"
            >
              <div className={styles.menu_text}>Car Configurator</div>
            </div>
            <div className={styles.line_in_menu}></div>
            <div
              className={[styles.menu_item, styles.menu_2].join(" ")}
              onClick={handleClickSubMenu1}
              name="MetaRealty"
            >
              <div className={styles.menu_text}>MetaRealty</div>
            </div>
            <div className={styles.line_in_menu}></div>
            <div
              className={[styles.menu_item, styles.menu_3].join(" ")}
              onClick={handleClickSubMenu1}
              name="Virtual Production"
            >
              <div className={styles.menu_text}>Virtual Production</div>
            </div>
            <div className={styles.line_in_menu}></div>
            <div
              className={[styles.menu_item, styles.menu_4].join(" ")}
              onClick={handleClickSubMenu1}
              name="Edulab"
            >
              <div className={styles.menu_text}>Edulab</div>
            </div>
            <div className={styles.line_in_menu}></div>
            <div
              className={[styles.menu_item, styles.menu_5].join(" ")}
              onClick={handleClickSubMenu1}
              name="Fashion-IX"
            >
              <div className={styles.menu_text}>Fashion-IX</div>
            </div>
            <div className={styles.line_in_menu}></div>
            <div
              className={[styles.menu_item, styles.menu_6].join(" ")}
              onClick={handleClickSubMenu1}
              name="Virtual Mart"
            >
              <div className={styles.menu_text}>Virtual Mart</div>
            </div>
          </div>

          <div className={styles.line_in_menu}></div>

          {/* Menu Item 2 (another main menu) */}
          <div
            className={[
              styles.menu_item,
              styles.menu_dropdown,
              styles.menu_item_2,
            ].join(" ")}
            onClick={handleClickTopLevelMenu}
            name="Menu Item 2"
          >
            <div className={styles.menu_text}>Menu Item 2</div>
            {/* You can add submenu here if needed */}
          </div>
          <div className={[styles.submenu, styles.submenu_2].join(" ")}>
            <div
              className={[styles.menu_item, styles.menu_1].join(" ")}
              onClick={handleClickSubMenu2}
              name="Meta Realty"
            >
              <div className={styles.menu_text}>Meta Realty</div>
            </div>
            <div className={styles.line_in_menu}></div>
            <div
              className={[styles.menu_item, styles.menu_2].join(" ")}
              onClick={handleClickSubMenu2}
              name="Car Configurator"
            >
              <div className={styles.menu_text}>Car Configurator</div>
            </div>
            <div className={styles.line_in_menu}></div>
            <div
              className={[styles.menu_item, styles.menu_3].join(" ")}
              onClick={handleClickSubMenu2}
              name="Fashion IX"
            >
              <div className={styles.menu_text}>Fashion IX</div>
            </div>
            <div className={styles.line_in_menu}></div>
            <div
              className={[styles.menu_item, styles.menu_4].join(" ")}
              onClick={handleClickSubMenu2}
              name="Edulab"
            >
              <div className={styles.menu_text}>Edulab</div>
            </div>
            <div className={styles.line_in_menu}></div>
            <div
              className={[styles.menu_item, styles.menu_5].join(" ")}
              onClick={handleClickSubMenu2}
              name="Virtual Mart"
            >
              <div className={styles.menu_text}>Virtual Mart</div>
            </div>
            <div className={styles.line_in_menu}></div>
            <div
              className={[styles.menu_item, styles.menu_6].join(" ")}
              onClick={handleClickSubMenu2}
              name="Virtual Museum"
            >
              <div className={styles.menu_text}>Virtual Museum</div>
            </div>
          </div>

          <div className={styles.line_in_menu}></div>

          {/* Menu Item 3 (another main menu) */}
          <div
            className={[
              styles.menu_item,
              styles.menu_dropdown,
              styles.menu_item_3,
            ].join(" ")}
            onClick={handleClickTopLevelMenu}
            name="Menu Item 3"
          >
            <div className={styles.menu_text}>Menu Item 3</div>
            {/* You can add submenu here if needed */}
          </div>
          <div className={[styles.submenu, styles.submenu_3].join(" ")}>
            <div
              className={[styles.menu_item, styles.menu_1].join(" ")}
              onClick={handleClickSubMenu3}
              name="social media 1"
            >
              <div className={styles.menu_text}>social media 1</div>
            </div>
            <div className={styles.line_in_menu}></div>
            <div
              className={[styles.menu_item, styles.menu_2].join(" ")}
              onClick={handleClickSubMenu3}
              name="social media 2"
            >
              <div className={styles.menu_text}>social media 2</div>
            </div>
            <div className={styles.line_in_menu}></div>
            <div
              className={[styles.menu_item, styles.menu_3].join(" ")}
              onClick={handleClickSubMenu3}
              name="social media 3"
            >
              <div className={styles.menu_text}>social media 3</div>
            </div>
            <div className={styles.line_in_menu}></div>
            <div
              className={[styles.menu_item, styles.menu_4].join(" ")}
              onClick={handleClickSubMenu3}
              name="social media 4"
            >
              <div className={styles.menu_text}>social media 4</div>
            </div>
            <div className={styles.line_in_menu}></div>
            <div
              className={[styles.menu_item, styles.menu_5].join(" ")}
              onClick={handleClickSubMenu3}
              name="social media 5"
            >
              <div className={styles.menu_text}>social media 5</div>
            </div>
            <div className={styles.line_in_menu}></div>
            <div
              className={[styles.menu_item, styles.menu_6].join(" ")}
              onClick={handleClickSubMenu3}
              name="social media 6"
            >
              <div className={styles.menu_text}>social media 6</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HamburgerMenu;
