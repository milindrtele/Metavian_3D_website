"use client";

import { useRef, useState, useEffect } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { LoadGLTFByPath } from "../lib/helpers/ModelHelper.js";
import PositionAlongPathState from "../lib/positionAlongPathTools/PositionAlongPathState.js";
import {
  handleScroll,
  updatePosition,
} from "../lib/positionAlongPathTools/PositionAlongPathMethods.js";
import { loadCurveFromJSON } from "../lib/curveTools/CurveMethods.js";
import { setupRenderer } from "../lib/helpers/RendererHelper.js";

export default function Scene() {
  const startingModelPathRef = useRef("/models/scene.glb");
  const curvePathJSONRef = useRef("/models/curvePath.json");

  const canvasRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);

  async function setupScene(canvas) {
    //Scene is container for objects, cameras, and lights
    sceneRef.current = new THREE.Scene();

    await LoadGLTFByPath(sceneRef.current, startingModelPathRef.current);

    let curvePath = await loadCurveFromJSON(
      sceneRef.current,
      curvePathJSONRef.current
    );

    // Comment to remove curve visualization
    // scene.add(curvePath.mesh);

    // Create a camera and set its position and orientation
    cameraRef.current = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    // camera.position.set(6, 3, 10);
    cameraRef.current.position.copy(curvePath.curve.getPointAt(0));
    cameraRef.current.lookAt(curvePath.curve.getPointAt(0.99));

    // Add the camera to the scene
    sceneRef.current.add(cameraRef.current);
    rendererRef.current = setupRenderer();

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 1);
    hemiLight.position.set(0, 0.116, 0);
    sceneRef.current.add(hemiLight);

    const dLight = new THREE.DirectionalLight(0xffffff, 2);
    dLight.position.set(5.0, 10.0, 7.5);
    sceneRef.current.add(dLight);

    let positionAlongPathState = new PositionAlongPathState();

    window.addEventListener("wheel", onMouseScroll, false);
    window.addEventListener("touchmove", onMouseScroll, false);

    function onMouseScroll(event) {
      handleScroll(event, positionAlongPathState);
    }

    // Animate the scene
    function animate() {
      requestAnimationFrame(animate);
      updatePosition(curvePath, cameraRef.current, positionAlongPathState);
      rendererRef.current.render(sceneRef.current, cameraRef.current);
    }
    animate();
  }

  useEffect(() => {
    let isMounted = true;
    setupScene();
  }, []);
  return (
    <div className="conatiner">
      <canvas id="canvas" className="canvas" ref={canvasRef}></canvas>
    </div>
  );
}
