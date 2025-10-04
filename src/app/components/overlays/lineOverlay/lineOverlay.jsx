import { useRef, useState, useEffect, use } from "react";
import styles from "./lineOverlay.module.css";

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

function LineOverlay({ progress }) {
  const lineRef = useRef(null);
  const [circleX, setCircleX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    // const handleMouseMove = (e) => {
    //   if (!isDragging || !lineRef.current) return;
    //   const rect = lineRef.current.getBoundingClientRect();
    //   let newX = (e.clientX - rect.left) * progress; // relative X position inside line
    //   newX = Math.max(0, Math.min(newX, rect.width)); // clamp to [0, line width]
    //   setCircleX(newX);
    // };

    const rect = lineRef.current.getBoundingClientRect();
    let newX = (e.clientX - rect.left) * progress; // relative X position inside line
    newX = Math.max(0, Math.min(newX, rect.width)); // clamp to [0, line width]
    setCircleX(newX);

    // const handleMouseUp = () => setIsDragging(false);

    // window.addEventListener("mousemove", handleMouseMove);
    // window.addEventListener("mouseup", handleMouseUp);

    return () => {
      //   window.removeEventListener("mousemove", handleMouseMove);
      //   window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, progress]);

  return (
    <div ref={lineRef} className={styles.line}>
      <div
        className={styles.circle}
        style={{ left: `${circleX}px` }}
        onMouseDown={() => setIsDragging(true)}
      ></div>
    </div>
  );
}

export default LineOverlay;
