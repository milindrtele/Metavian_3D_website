import React, { useState, useRef, useEffect } from "react";
import styles from "./audio_overlay.module.css";

export default function AudioOverlay({ audioSrc, onClose }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isScrollerVisible, setIsScrollerVisible] = useState(false);
  const audioRef = useRef(null);

  const audioClicked = () => {
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) {
      setIsScrollerVisible(true);
    }
  }, []);

  return (
    <>
      {isScrollerVisible ? <div className={styles.scroller}></div> : null}
      <div
        className={styles.audio_overlay_container}
        onClick={() => {
          audioClicked();
        }}
      >
        <div className={styles.audio_icon}></div>
        {isPlaying ? null : <div className={styles.cross_line}></div>}
        <audio ref={audioRef} className={styles.audio} autoPlay loop>
          <source
            src="/audio/Thoughts_source_910353/Thoughts.mp3"
            type="audio/mpeg"
          ></source>
          {/* <source src="audio.ogg" type="audio/ogg"></source> */}
          Your browser does not support the audio element.
        </audio>
      </div>
    </>
  );
}
