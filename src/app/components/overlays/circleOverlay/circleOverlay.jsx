import { useRef, useState, useEffect, use } from "react";
import styles from "./circleOverlay.module.css";

const overlayVariants = [
  {
    id: 1,
    angle: 300,
    name: "Meta Realty",
    leg_name: "leg_01_1",
    description: "Description for Car Configurator",
  },
  {
    id: 2,
    angle: 240,
    name: "Car Configurator",
    leg_name: "leg_02_1",
    description: "Description for Meta Realty",
  },
  {
    id: 3,
    angle: 180,
    name: "Fashion IX",
    leg_name: "leg_03_1",
    description: "Description for Virtual Production",
  },
  {
    id: 4,
    angle: 120,
    name: "Edulab",
    leg_name: "leg_04_1",
    description: "Description for Edulab",
  },
  {
    id: 5,
    angle: 60,
    name: "Virtual Mart",
    leg_name: "leg_05_1",
    description: "Description for Fashion IX",
  },
  {
    id: 6,
    angle: 0,
    name: "Virtual Museum",
    leg_name: "leg_06_1",
    description: "Description for Virtual Mart",
  },
];

function CircleOverlay({ circleSelected, selectedLeg }) {
  const [selectedVariant, setSelectedVariant] = useState(null);
  const overlay_containerRef = useRef(null);
  const timeoutRef = useRef(null);
  const overlayContainerRef = useRef(null);
  const description_containerRef = useRef(null);

  useEffect(() => {
    if (selectedVariant) {
      description_containerRef.current.style.opacity = 0;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
          description_containerRef.current.style.opacity = 1;
        }, 3000);
      } else {
        timeoutRef.current = setTimeout(() => {
          description_containerRef.current.style.opacity = 1;
        }, 3000);
      }
    }
  }, [selectedVariant]);

  useEffect(() => {
    if (selectedLeg) {
      const variant = overlayVariants.find(
        (variant) => variant.leg_name === selectedLeg
      );
      setSelectedVariant(variant);
      overlayContainerRef.current.style.transform = `rotate(${variant.angle}deg)`;
    }
  }, [selectedLeg]);

  function hoverEffect(e) {
    // e.currentTarget.style.transform = "scale(1.1)";
    e.currentTarget.style.backgroundColor = "rgba(66, 148, 255, 1)";
  }
  function hoverEffectOut(e) {
    // e.currentTarget.style.transform = "scale(1)";
    e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 1)";
  }
  function animateOnClick(e) {
    if (e.currentTarget.title) {
      const variant = overlayVariants.find(
        (variant) =>
          variant.id.toString() === e.currentTarget.title.split("_")[1]
      );
      // setSelectedVariant(variant);
      // //
      // overlayContainerRef.current.style.transform = `rotate(${variant.angle}deg)`;
      // //
      // console.log("Clicked on circle: ", e);

      //setSelectedVariant(variant);
      circleSelected(variant.name);
    }
  }
  function addClass() {}

  return (
    <>
      <div ref={overlayContainerRef} className={styles.overlay_container}>
        <div className={styles.outer_circle}>
          <div className={styles.inner_circle_container}>
            <div
              title="circle_1"
              className={[
                styles.inner_circle,
                styles.inner_circle_1,
                selectedVariant && selectedVariant.id === 1
                  ? styles.selected
                  : "",
              ].join(" ")}
              onMouseEnter={hoverEffect}
              onMouseLeave={hoverEffectOut}
              onClick={(e) => {
                animateOnClick(e);
              }}
            ></div>
            <div
              title="circle_2"
              className={[
                styles.inner_circle,
                styles.inner_circle_2,
                selectedVariant && selectedVariant.id === 2
                  ? styles.selected
                  : "",
              ].join(" ")}
              onMouseEnter={hoverEffect}
              onMouseLeave={hoverEffectOut}
              onClick={(e) => {
                animateOnClick(e);
              }}
            ></div>
            <div
              title="circle_3"
              className={[
                styles.inner_circle,
                styles.inner_circle_3,
                selectedVariant && selectedVariant.id === 3
                  ? styles.selected
                  : "",
              ].join(" ")}
              onMouseEnter={hoverEffect}
              onMouseLeave={hoverEffectOut}
              onClick={(e) => {
                animateOnClick(e);
              }}
            ></div>
            <div
              title="circle_4"
              className={[
                styles.inner_circle,
                styles.inner_circle_4,
                selectedVariant && selectedVariant.id === 4
                  ? styles.selected
                  : "",
              ].join(" ")}
              onMouseEnter={hoverEffect}
              onMouseLeave={hoverEffectOut}
              onClick={(e) => {
                animateOnClick(e);
              }}
            ></div>
            <div
              title="circle_5"
              className={[
                styles.inner_circle,
                styles.inner_circle_5,
                selectedVariant && selectedVariant.id === 5
                  ? styles.selected
                  : "",
              ].join(" ")}
              onMouseEnter={hoverEffect}
              onMouseLeave={hoverEffectOut}
              onClick={(e) => {
                animateOnClick(e);
              }}
            ></div>
            <div
              title="circle_6"
              className={[
                styles.inner_circle,
                styles.inner_circle_6,
                selectedVariant && selectedVariant.id === 6
                  ? styles.selected
                  : "",
              ].join(" ")}
              onMouseEnter={hoverEffect}
              onMouseLeave={hoverEffectOut}
              onClick={(e) => {
                animateOnClick(e);
              }}
            ></div>
          </div>
        </div>
      </div>
      {selectedVariant && (
        <div
          ref={description_containerRef}
          className={styles.description_container}
        >
          <h2>{selectedVariant.name}</h2>
          <p>{selectedVariant.description}</p>
        </div>
      )}
    </>
  );
}
export default CircleOverlay;
