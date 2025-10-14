import React, { useState, useRef, useEffect } from "react";
import styles from "./LandScapeMessage.module.css";

export default function LandScapeMessage() {
  return (
    <>
      <div className={styles.container}>
        <p>
          This website is best viewed in landscape mode, please rotate your
          screen.
        </p>
      </div>
    </>
  );
}
