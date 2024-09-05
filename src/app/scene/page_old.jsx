"use client";

import { useRef, useState, useEffect } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

export default function Scene() {
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    const canvas = canvasRef.current;
    // Scene
    sceneRef.current = new THREE.Scene();

    // Camera
    cameraRef.current = new THREE.PerspectiveCamera(
      75,
      canvas.clientWidth / canvas.clientHeight,
      0.1,
      1000
    );
    cameraRef.current.position.z = 5;

    // Renderer
    rendererRef.current = new THREE.WebGLRenderer({ canvas });
    rendererRef.current.setSize(canvas.clientWidth, canvas.clientHeight);

    // Instantiate a loader
    const loader = new GLTFLoader();

    // Load a glTF resource
    loader.load(
      // resource URL
      "/models/camera animations.glb",
      // called when the resource is loaded
      function (gltf) {
        if (isMounted) {
          sceneRef.current.add(gltf.scene);
        }

        gltf.animations; // Array<THREE.AnimationClip>
        gltf.scene; // THREE.Group
        gltf.scenes; // Array<THREE.Group>
        gltf.cameras; // Array<THREE.Camera>
        gltf.asset; // Object

        console.log(gltf);
      },
      // called while loading is progressing
      function (xhr) {
        console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
      },
      // called when loading has errors
      function (error) {
        console.log("An error happened");
      }
    );

    const light = new THREE.AmbientLight(0xffffff, 2); // soft white light
    sceneRef.current.add(light);

    // Animation
    const animate = () => {
      requestAnimationFrame(animate);
      rendererRef.current.render(sceneRef.current, cameraRef.current);
    };

    animate();

    // Handle window resize
    const handleResize = () => {
      canvasRef.current.width = window.innerWidth;
      canvasRef.current.height = window.innerHeight;
      const newWidth = canvas.clientWidth;
      const newHeight = canvas.clientHeight;

      console.log(newWidth, newHeight);

      cameraRef.current.aspect = newWidth / newHeight;
      cameraRef.current.updateProjectionMatrix();

      rendererRef.current.setSize(newWidth, newHeight);
    };

    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      isMounted = false;
    };
  }, []);
  return (
    <div className="conatiner">
      <canvas className="canvas" ref={canvasRef}></canvas>
    </div>
  );
}
