// app/page.jsx
import { div } from 'three/examples/jsm/nodes/Nodes';
import styles from './page.module.css';

export default function Home() {
  return (
    <div className={styles.body}>
    <nav className={styles.menu}>
      <input type="checkbox" className={styles.menuOpen} name="menu-open" id="menu-open" />
      <label className={styles.menuOpenButton} htmlFor="menu-open">
        <span className={`${styles.lines} ${styles.line1}`}></span>
        <span className={`${styles.lines} ${styles.line2}`}></span>
        <span className={`${styles.lines} ${styles.line3}`}></span>
      </label>

      <a href="#" className={`${styles.menuItem} ${styles.blue}`}> <i className="fa fa-anchor"></i> </a>
      <a href="#" className={`${styles.menuItem} ${styles.green}`}> <i className="fa fa-coffee"></i> </a>
      <a href="#" className={`${styles.menuItem} ${styles.red}`}> <i className="fa fa-heart"></i> </a>
      <a href="#" className={`${styles.menuItem} ${styles.purple}`}> <i className="fa fa-microphone"></i> </a>
      <a href="#" className={`${styles.menuItem} ${styles.orange}`}> <i className="fa fa-star"></i> </a>
      <a href="#" className={`${styles.menuItem} ${styles.lightblue}`}> <i className="fa fa-diamond"></i> </a>
    </nav>
    </div>
  );
}
