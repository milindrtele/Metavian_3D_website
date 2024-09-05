"use client";

import { useRef, useState, useEffect } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import cubeVertex from "../lib/shaders/cubeVertex.glsl";
import cubeFragment from "../lib/shaders/cubeFragment.glsl";

import Stats from "three/addons/libs/stats.module.js";

export default function Horizon() {
  let stats = null;

  const canvasRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);

  const baseCubeRef = useRef(null);
  const instancedMeshRef = useRef(null);
  let dummy = new THREE.Object3D();

  async function setupScene(canvas) {
    stats = new Stats();
    document.body.appendChild(stats.dom);

    //Scene is container for objects, cameras, and lights
    sceneRef.current = new THREE.Scene();

    rendererRef.current = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
    });

    rendererRef.current.setSize(window.innerWidth, window.innerHeight);

    // Create a camera and set its position and orientation
    cameraRef.current = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    cameraRef.current.position.set(0, 0, 10);
    controlsRef.current = new OrbitControls(
      cameraRef.current,
      rendererRef.current.domElement
    );

    // Add the camera to the scene
    sceneRef.current.add(cameraRef.current);

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 1);
    hemiLight.position.set(0, 0.116, 0);
    sceneRef.current.add(hemiLight);

    const dLight = new THREE.DirectionalLight(0xffffff, 2);
    dLight.position.set(5.0, 10.0, 7.5);
    sceneRef.current.add(dLight);

    const shaderMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 1.0 },
        resolution: { value: new THREE.Vector2() },
      },

      vertexShader: cubeVertex,
      fragmentShader: cubeFragment,
    });

    const loader = new GLTFLoader();

    loader.load("/models/hexagon_b.glb", (gltf) => {
      baseCubeRef.current = gltf.scene;
      //baseCubeRef.current.position.set(0, -5, 0);
      //sceneRef.current.add(baseCubeRef.current);

      // Now that the base cube is loaded, create the InstancedMesh
      let mat = new THREE.MeshStandardMaterial({});
      let rows = 100;
      let count = rows * rows;

      let random = new Float32Array(count);
      instancedMeshRef.current = new THREE.InstancedMesh(
        baseCubeRef.current.children[0].geometry, // Use the geometry of the loaded cube
        shaderMaterial,
        count
      );

      if (instancedMeshRef.current.parent != sceneRef.current) {
        sceneRef.current.add(instancedMeshRef.current);
      }

      let index = 0;
      //   for (let i = 0; i < rows; i++) {
      //     for (let j = 0; j < rows; j++) {
      //       random[index] = Math.random();
      //       dummy.position.set(i - rows / 2, -5, j - rows / 2);
      //       dummy.updateMatrix();
      //       instancedMeshRef.current.setMatrixAt(index++, dummy.matrix);
      //     }
      //   }
      let spacing = 2; // Adjust this value to increase or decrease spacing
      let xSpacing = 1.73;
      let ySpacing = 1.5;
      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < rows; j++) {
          random[index] = Math.random();
          if (j % 2 == 1) {
            dummy.position.set(
              0.865 + i * xSpacing - (rows * xSpacing) / 2,
              -5,
              j * ySpacing - (rows * ySpacing) / 2
            );
          } else {
            dummy.position.set(
              i * xSpacing - (rows * xSpacing) / 2,
              -5,
              j * ySpacing - (rows * ySpacing) / 2
            );
          }

          // dummy.position.set(j + xSpacing, -5, i * ySpacing);

          dummy.updateMatrix();
          instancedMeshRef.current.setMatrixAt(index++, dummy.matrix);
          // console.log(instancedMeshRef.current);
        }
      }
      instancedMeshRef.current.instanceMatrix.needsUpdate = true;

      instancedMeshRef.current.geometry.setAttribute(
        "aRandom",
        new THREE.InstancedBufferAttribute(random, 1)
      );
    });

    // Animate the scene
    let time = 0;
    function animate() {
      stats.update();
      requestAnimationFrame(animate);

      time += 0.01;
      shaderMaterial.uniforms.time.value = time;

      controlsRef.current.update();
      rendererRef.current.render(sceneRef.current, cameraRef.current);
    }
    animate();
  }

  useEffect(() => {
    let isMounted = true;
    setupScene();
  }, []);
  return (
    <div className="container">
      <canvas id="canvas" className="canvas" ref={canvasRef}></canvas>
    </div>
  );
}
