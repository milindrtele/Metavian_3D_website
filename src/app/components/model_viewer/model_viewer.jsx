import { useEffect, useState, useRef } from "react";
import * as THREE from "three";
import styles from "./model_viewer.module.css";

import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { RGBELoader } from "three/addons/loaders/RGBELoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

export default function Model_viewer(props) {
  const model_viewer_canvasRef = useRef(null);
  const animationIdRef = useRef(null);
  //set ref for scene, camera, renderer
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const orbitControlsRef = useRef(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);

  const gltfloader = new GLTFLoader();

  useEffect(() => {
    model_viewer_canvasRef.current = document.getElementById(
      "model_viewer_canvas"
    );
    sceneRef.current = new THREE.Scene();
    cameraRef.current = new THREE.PerspectiveCamera(
      75,
      model_viewer_canvasRef.current.clientWidth /
        model_viewer_canvasRef.current.clientHeight,
      0.1,
      1000
    );

    cameraRef.current.position.set(0, 0, -10);

    rendererRef.current = new THREE.WebGLRenderer({
      canvas: model_viewer_canvasRef.current,
      antialias: true,
    });
    rendererRef.current.setSize(
      model_viewer_canvasRef.current.clientWidth,
      model_viewer_canvasRef.current.clientHeight
    );

    orbitControlsRef.current = new OrbitControls(
      cameraRef.current,
      model_viewer_canvasRef.current
    );
    orbitControlsRef.current.update();

    gltfloader.load("models/chat_bot/cleaned_beepie.glb", (gltf) => {
      sceneRef.current.add(gltf.scene);
      parent = gltf.scene.getObjectByName("parent");
    });

    new RGBELoader().load(
      "vitruvian_man/odyssey_0_5K_6e3c37df-221e-49b9-8447-39a50559d19e.hdr",
      function (texture) {
        texture.mapping = THREE.EquirectangularReflectionMapping;
        sceneRef.current.environment = texture;
      }
    );

    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);

      // required if controls.enableDamping or controls.autoRotate are set to true
      orbitControlsRef.current.update();

      rendererRef.current.render(sceneRef.current, cameraRef.current);
    };
    animate();

    // Cleanup when component unmounts
    return () => {
      cancelAnimationFrame(animationIdRef.current);
      rendererRef.current.dispose();
      //document.body.removeChild(model_viewer_canvasRef.current);
    };
  }, []);
  return (
    <div className={[styles.model_viewer_container].join(" ")}>
      <canvas
        id="model_viewer_canvas"
        className={[styles.model_viewer_canvas].join(" ")}
      ></canvas>
    </div>
  );
}
