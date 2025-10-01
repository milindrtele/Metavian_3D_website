import { useRef, useState, useEffect } from "react";
import styles from "./useCaseScreenOverlay.module.css";

const overlayVariants = [
  {
    id: 1,
    name: "Meta Realty",
    leg_name: "leg_01_1",
    description: "Description for Car Configurator",
  },
  {
    id: 2,
    name: "Car Configurator",
    leg_name: "leg_02_1",
    description: "Description for Meta Realty",
  },
  {
    id: 3,
    name: "Fashion IX",
    leg_name: "leg_03_1",
    description: "Description for Virtual Production",
  },
  {
    id: 4,
    name: "Edulab",
    leg_name: "leg_04_1",
    description: "Description for Edulab",
  },
  {
    id: 5,
    name: "Virtual Mart",
    leg_name: "leg_05_1",
    description: "Description for Fashion IX",
  },
  {
    id: 6,
    name: "Virtual Museum",
    leg_name: "leg_06_1",
    description: "Description for Virtual Mart",
  },
];

function UseCaseScreenOverlay({ isActive, onClose, selectedObject }) {
  const [selectedVariant, setSelectedVariant] = useState(null);
  const overlay_containerRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (selectedObject) {
      console.log(selectedObject);
      const variant = overlayVariants.find(
        (variant) => variant.leg_name === selectedObject.name
      );
      setSelectedVariant(variant);
    } else {
      setSelectedVariant(null);
    }
  }, [selectedObject]);

  function animateOverlayFadeIn() {
    if (overlay_containerRef.current) {
      overlay_containerRef.current.style.transition =
        "opacity 0.5s ease-in-out";
      overlay_containerRef.current.style.opacity = "1";
    }
  }
  function animateOverlayFadeOut() {
    if (overlay_containerRef.current) {
      overlay_containerRef.current.style.transition =
        "opacity 0.5s ease-in-out";
      overlay_containerRef.current.style.opacity = "0";
    }
  }

  useEffect(() => {
    if (selectedVariant && overlay_containerRef.current) {
      animateOverlayFadeIn();
      // Clear any existing timeout
      if (timeoutRef.current != null) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      } else {
        timeoutRef.current = setTimeout(() => {
          animateOverlayFadeOut();
        }, 3000);
      }
    } else if (selectedVariant === null && overlay_containerRef.current) {
      animateOverlayFadeOut();
    }
  }, [selectedVariant]);

  return (
    <>
      {/* {isActive && ( */}
      <div ref={overlay_containerRef} className={styles.overlay_container}>
        <div className={styles.overlay_content}>
          <h2>{selectedVariant?.name}</h2>
          {/* <p>This is the content of the products screen overlay.</p> */}
        </div>
      </div>
      {/* )} */}
    </>
  );
}
export default UseCaseScreenOverlay;
