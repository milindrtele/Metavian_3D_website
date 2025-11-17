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
  const containerRef = useRef(null);
  const needleRef = useRef(null);
  const routeRef = useRef(null);
  const pathRef = useRef(null);
  const [circleY, setCircleY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  //
  let scrollObj = {
    pos: 0,
  };
  var length = 0; // Object to animate the scroll position
  var pathLength;

  // useEffect(() => {
  //   const handleMouseMove = (e) => {
  //     if (!isDragging || !containerRef.current) return;
  //     const rect = containerRef.current.getBoundingClientRect();
  //     let newY = e.clientY - rect.top; // relative X position inside line
  //     newY = Math.max(0, Math.min(newY, rect.height)); // clamp to [0, line height]
  //     setCircleY(newY);
  //   };

  //   const handleMouseUp = () => setIsDragging(false);

  //   window.addEventListener("mousemove", handleMouseMove);
  //   window.addEventListener("mouseup", handleMouseUp);

  //   return () => {
  //     window.removeEventListener("mousemove", handleMouseMove);
  //     window.removeEventListener("mouseup", handleMouseUp);
  //   };
  // }, [isDragging]);

  // // Draw the line
  // function drawLine(container, line, multiplier) {
  //   pathLength = line.getTotalLength();
  //   length = pathLength * multiplier; // Use scrollObj.pos instead of scrollPos
  //   line.style.strokeDasharray = [length, pathLength].join(" ");
  // }

  // useEffect(() => {
  //   if (!routeRef.current) return;

  //   const rect = containerRef.current.getBoundingClientRect();
  //   let newY = progress * rect.height; // relative X position inside line
  //   newY = Math.max(0, Math.min(newY, rect.height)); // clamp to [0, line height]
  //   setCircleY(newY);

  //   drawLine(routeRef.current, pathRef.current, progress);
  // }, [progress, pathRef.current, routeRef.current]);

  // useEffect(() => {
  //   if (!routeRef.current) return;
  //   drawLine(routeRef.current, pathRef.current, 0);
  // }, [pathRef.current, routeRef.current]);

  useEffect(() => {
    let angle = (Math.min(Math.max(progress, 0), 0.96) / 0.96) * 360;
    changeFov(angle);
    //changeAngle(angle);
  }, [progress]);

  function changeAngle(angle) {
    const Rangle = `${angle}deg`; // Set the angle dynamically based on the `fov` parameter
    needleRef.current.style.transform = `translate(-50%, -50%) rotate(${Rangle})`;
  }

  function changeFov(fov) {
    const angle = `${fov}deg`; // Set the angle dynamically based on the `fov` parameter
    const reverseAngle = `${360 - fov}deg`;

    needleRef.current.style.background = `conic-gradient(
      rgba(0, 255, 221, 0.725) ${angle},
      rgba(73, 158, 255, 0.5) ${angle}
    )`;
    // needleRef.current.style.background = `conic-gradient(from ${angle} at 50% 50%, #00ffbb04, #00ffd0ff, #00ffd0ff )`;
  }

  useEffect(() => {
    if (progress <= 0.1) {
      containerRef.current.classList.remove(styles.position_left_bottom);
    } else {
      containerRef.current.classList.add(styles.position_left_bottom);
    }
  }, [progress]);

  return (
    <div ref={containerRef} className={styles.container}>
      <div className={styles.scroll_instructions}>Scroll to Interact</div>
      <div className={styles.compass_container}>
        <div className={styles.compass}></div>
        <div ref={needleRef} className={styles.needle}></div>
      </div>
    </div>
  );
}

export default LineOverlay;
