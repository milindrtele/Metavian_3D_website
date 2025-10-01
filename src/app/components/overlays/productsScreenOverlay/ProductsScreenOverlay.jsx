import { useRef, useState, useEffect } from "react";
import styles from "./productsScreenOverlay.module.css";

const overlayVariants = [
  {
    id: 1,

    name: "Car Configurator",
    model_name: "car_configurator",
    description: "Description for Car Configurator",
  },
  {
    id: 2,
    name: "Meta Realty",
    model_name: "meta_realty",
    description: "Description for Meta Realty",
  },
  {
    id: 3,
    name: "Virtual Production",
    model_name: "virtual_production",
    description: "Description for Virtual Production",
  },
  {
    id: 4,
    name: "Edulab",
    model_name: "edulab_v1",
    description: "Description for Edulab",
  },
  {
    id: 5,
    name: "Fashion IX",
    model_name: "fashion_ix",
    description: "Description for Fashion IX",
  },
  {
    id: 6,
    name: "Virtual Mart",
    model_name: "virtual_mart",
    description: "Description for Virtual Mart",
  },
];

function ProductsScreenOverlay({ isActive, onClose, selectedObject }) {
  const [selectedVariant, setSelectedVariant] = useState(null);
  const overlay_containerRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (selectedObject) {
      const variant = overlayVariants.find(
        (variant) => variant.model_name === selectedObject.parent.name
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
export default ProductsScreenOverlay;
