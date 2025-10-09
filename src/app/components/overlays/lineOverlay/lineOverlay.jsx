import { useRef, useState, useEffect } from "react";
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

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      let newY = e.clientY - rect.top; // relative X position inside line
      newY = Math.max(0, Math.min(newY, rect.height)); // clamp to [0, line height]
      setCircleY(newY);
    };

    const handleMouseUp = () => setIsDragging(false);

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  // Draw the line
  function drawLine(container, line, multiplier) {
    pathLength = line.getTotalLength();
    length = pathLength * multiplier; // Use scrollObj.pos instead of scrollPos
    line.style.strokeDasharray = [length, pathLength].join(" ");
  }

  useEffect(() => {
    if (!routeRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    let newY = progress * rect.height; // relative X position inside line
    newY = Math.max(0, Math.min(newY, rect.height)); // clamp to [0, line height]
    setCircleY(newY);

    drawLine(routeRef.current, pathRef.current, progress);
  }, [progress, pathRef.current, routeRef.current]);

  useEffect(() => {
    if (!routeRef.current) return;
    drawLine(routeRef.current, pathRef.current, 0);
  }, [pathRef.current, routeRef.current]);

  return (
    <div ref={containerRef} className={styles.container}>
      {/* <svg
        className={[styles.svg_path].join(" ")}
        // ref={routeRef}
        id="route_gray"
        xmlns="http://www.w3.org/2000/svg"
        xmlSpace="preserve"
        width="322.653mm"
        height="72.698mm"
        version="1.1"
        style={{
          shapeRendering: "geometricPrecision",
          textRendering: "geometricPrecision",
          imageRendering: "optimizeQuality",
          fillRule: "evenodd",
          clipRule: "evenodd",
        }}
        viewBox="0 0 32265.28 7269.8"
        xmlnsXlink="http://www.w3.org/1999/xlink"
      >
        <g id="Layer_x0020_1">
          <metadata id="CorelCorpID_0Corel-Layer" />
          <defs>
            <linearGradient id="grad1" x1="0%" x2="100%" y1="0%" y2="0%">
              <stop offset="0%" stopColor="#65BA97" />
              <stop offset="25%" stopColor="#518262" />
              <stop offset="50%" stopColor="#7BCED3" />
              <stop offset="75%" stopColor="#419098" />
              <stop offset="100%" stopColor="#598ED4" />
            </linearGradient>
          </defs>
          <path
            id="path_gray"
            // ref={pathRef}
            className=""
            stroke="#555555"
            strokeWidth="300"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeMiterlimit="22.9256"
            fill="none"
            d="M50.26 2931.38l1791.1 -0.03c-101.95,-1576.4 1323.97,-2880.75 2845.93,-2880.75 1572.9,0 2847.98,1252.56 2847.98,2797.65 0,513.84 -1.06,1042.79 -1.06,1562.81 0,1545.09 1275.08,2797.65 2847.96,2797.65 1572.9,0 2847.98,-1252.56 2847.98,-2797.65 0,-525.89 -0.43,-1052.89 -0.43,-1578 0,-1545.09 1275.08,-2797.65 2847.96,-2797.65 1572.9,0 2847.98,1252.56 2847.98,2797.65 0,538.4 -0.42,1076.83 -0.42,1615.2 0,1545.09 1275.08,2797.65 2847.96,2797.65 1572.9,0 2847.98,-1252.56 2847.98,-2797.65 0,-538.39 -1.79,-1076.9 -1.79,-1615.2 0,-1545.09 1275.08,-2797.65 2847.96,-2797.65 1597.8,0 2894.11,1288.41 2846.35,2895.97l1884.19 0m0 0l-211.96 -218.04m211.96 218.04l-213.21 271.1"
          />
        </g>
      </svg> */}
      {/*  */}
      {/* <svg
        className={[styles.svg_path].join(" ")}
        ref={routeRef}
        id="route"
        xmlns="http://www.w3.org/2000/svg"
        xmlSpace="preserve"
        width="322.653mm"
        height="72.698mm"
        version="1.1"
        style={{
          shapeRendering: "geometricPrecision",
          textRendering: "geometricPrecision",
          imageRendering: "optimizeQuality",
          fillRule: "evenodd",
          clipRule: "evenodd",
        }}
        viewBox="0 0 32265.28 7269.8"
        xmlnsXlink="http://www.w3.org/1999/xlink"
      >
        <g id="Layer_x0020_1">
          <metadata id="CorelCorpID_0Corel-Layer" />
          <defs>
            <linearGradient id="grad1" x1="0%" x2="100%" y1="0%" y2="0%">
              <stop offset="0%" stopColor="#65BA97" />
              <stop offset="25%" stopColor="#518262" />
              <stop offset="50%" stopColor="#7BCED3" />
              <stop offset="75%" stopColor="#419098" />
              <stop offset="100%" stopColor="#598ED4" />
            </linearGradient>
          </defs>
          <path
            id="path"
            ref={pathRef}
            className=""
            stroke="url(#grad1)"
            strokeWidth="300"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeMiterlimit="22.9256"
            fill="none"
            d="M50.26 2931.38l1791.1 -0.03c-101.95,-1576.4 1323.97,-2880.75 2845.93,-2880.75 1572.9,0 2847.98,1252.56 2847.98,2797.65 0,513.84 -1.06,1042.79 -1.06,1562.81 0,1545.09 1275.08,2797.65 2847.96,2797.65 1572.9,0 2847.98,-1252.56 2847.98,-2797.65 0,-525.89 -0.43,-1052.89 -0.43,-1578 0,-1545.09 1275.08,-2797.65 2847.96,-2797.65 1572.9,0 2847.98,1252.56 2847.98,2797.65 0,538.4 -0.42,1076.83 -0.42,1615.2 0,1545.09 1275.08,2797.65 2847.96,2797.65 1572.9,0 2847.98,-1252.56 2847.98,-2797.65 0,-538.39 -1.79,-1076.9 -1.79,-1615.2 0,-1545.09 1275.08,-2797.65 2847.96,-2797.65 1597.8,0 2894.11,1288.41 2846.35,2895.97l1884.19 0m0 0l-211.96 -218.04m211.96 218.04l-213.21 271.1"
          />
        </g>
      </svg> */}
      <svg
        data-name="Layer 1"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 841.89 595.28"
        className={styles.svg_path}
        id="route_gray"
      >
        {/* <g id="Layer_x0020_1">
          <metadata id="CorelCorpID_0Corel-Layer" /> */}
        <title>path_02</title>

        <path
          id="path_gray"
          d="M426.5,29a103.81,103.81,0,0,1,28.65,7.23A85.14,85.14,0,0,1,503,86.09c.3.85.6,1.69.88,2.54,7,20.92,28.37,33.15,50.12,29.46a92.75,92.75,0,0,1,16.85-1.3c49.94.67,90.67,41.55,91.16,91.5a92,92,0,0,1-21.44,60.11,44.72,44.72,0,0,0,.41,57.79,92.47,92.47,0,0,1-86.67,151A44.54,44.54,0,0,0,504,506.87c-.26.8-.53,1.6-.82,2.4a85.08,85.08,0,0,1-48,50.37A102.63,102.63,0,0,1,422,567.25a102.63,102.63,0,0,1-33.27-7.61,85.08,85.08,0,0,1-48-50.37c-.29-.8-.56-1.6-.82-2.4a44.54,44.54,0,0,0-50.28-29.72,92.44,92.44,0,0,1-86.67-151,44.72,44.72,0,0,0,.41-57.79,92,92,0,0,1-21.44-60.11c.49-49.95,41.22-90.83,91.16-91.5a92.75,92.75,0,0,1,16.85,1.3c21.75,3.69,43.11-8.54,50.12-29.46.28-.85.58-1.69.88-2.54a85.14,85.14,0,0,1,47.82-49.91A103.83,103.83,0,0,1,417.39,29"
          // transform="translate(-180.73 -28.83)"
          style={{
            fill: "none",
            stroke: "#6a6a6a8a",
            strokeMiterlimit: 10,
            strokeWidth: "20",
          }}
        />
        {/* </g> */}
      </svg>
      {/*  */}
      <svg
        data-name="Layer 1"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 841.89 595.28"
        className={styles.svg_path}
        ref={routeRef}
        id="route"
      >
        {/* <g id="Layer_x0020_1">
          <metadata id="CorelCorpID_0Corel-Layer" /> */}
        <title>path_02</title>
        <defs>
          <linearGradient id="grad1" x1="0%" x2="100%" y1="0%" y2="0%">
            <stop offset="0%" stopColor="#65BA97" />
            <stop offset="25%" stopColor="#518262" />
            <stop offset="50%" stopColor="#7BCED3" />
            <stop offset="75%" stopColor="#419098" />
            <stop offset="100%" stopColor="#598ED4" />
          </linearGradient>
        </defs>

        <path
          id="path"
          ref={pathRef}
          stroke="url(#grad1)"
          d="M426.5,29a103.81,103.81,0,0,1,28.65,7.23A85.14,85.14,0,0,1,503,86.09c.3.85.6,1.69.88,2.54,7,20.92,28.37,33.15,50.12,29.46a92.75,92.75,0,0,1,16.85-1.3c49.94.67,90.67,41.55,91.16,91.5a92,92,0,0,1-21.44,60.11,44.72,44.72,0,0,0,.41,57.79,92.47,92.47,0,0,1-86.67,151A44.54,44.54,0,0,0,504,506.87c-.26.8-.53,1.6-.82,2.4a85.08,85.08,0,0,1-48,50.37A102.63,102.63,0,0,1,422,567.25a102.63,102.63,0,0,1-33.27-7.61,85.08,85.08,0,0,1-48-50.37c-.29-.8-.56-1.6-.82-2.4a44.54,44.54,0,0,0-50.28-29.72,92.44,92.44,0,0,1-86.67-151,44.72,44.72,0,0,0,.41-57.79,92,92,0,0,1-21.44-60.11c.49-49.95,41.22-90.83,91.16-91.5a92.75,92.75,0,0,1,16.85,1.3c21.75,3.69,43.11-8.54,50.12-29.46.28-.85.58-1.69.88-2.54a85.14,85.14,0,0,1,47.82-49.91A103.83,103.83,0,0,1,417.39,29"
          // transform="translate(-180.73 -28.83)"
          style={{
            fill: "none",
            // stroke: "#ffffffff",
            strokeMiterlimit: 10,
            strokeWidth: "20",
          }}
        />
        {/* </g> */}
      </svg>
    </div>
  );
}

export default LineOverlay;
