"use client";

import { useRef, useState, useEffect } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import cubeVertex from "../lib/shaders/cubeVertex2.glsl";
import cubeFragment from "../lib/shaders/cubeFragment2.glsl";

import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { SSRPass } from "three/addons/postprocessing/SSRPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { TAARenderPass } from "three/addons/postprocessing/TAARenderPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";

import { RGBELoader } from "three/addons/loaders/RGBELoader.js";

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

  const greenObjectsRef = useRef(null);
  let shaderMaterial;
  const matcapTextureRef = useRef(null);

  const taaRenderPassRef = useRef(null);

  // function animateGreen(time) {
  //   if (greenObjectsRef.current != null) {
  //     greenObjectsRef.current.traverse((child) => {
  //       if (child instanceof THREE.Mesh) {
  //         let aRandom = Math.random();
  //         //console.log(aRandom);
  //         child.position.y = Math.sin(time * 15.0 * aRandom);
  //         console.log(time);
  //       }
  //     });
  //   }
  // }

  // function animateGreen(time) {
  //   if (greenObjectsRef.current != null) {
  //     greenObjectsRef.current.traverse((child) => {
  //       if (child instanceof THREE.Mesh) {
  //         child.material = shaderMaterial;

  //         if (!child.geometry.attributes.aRandom) {
  //           const count = child.geometry.attributes.position.count;
  //           const randoms = new Float32Array(count);
  //           // for (let i = 0; i < count; i++) {
  //           //   randoms[i] = Math.random();
  //           // }
  //           // child.geometry.setAttribute(
  //           //   "aRandom",
  //           //   new THREE.BufferAttribute(randoms, 1)
  //           // );
  //         }

  //         console.log(child);
  //       }
  //     });
  //   }
  // }

  function createShaderMaterial(aRandomValue) {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0.0 },
        aRandom: { value: aRandomValue },
        matcapTexture: {
          value: matcapTextureRef.current,
        },
      },
      vertexShader: cubeVertex,
      fragmentShader: cubeFragment,
    });
  }
  function animateGreen(time) {
    if (greenObjectsRef.current != null) {
      const material1 = new THREE.MeshStandardMaterial({
        color: 0xff0000,
        roughness: 0.1,
        alphaTest: 0.5,
      });

      greenObjectsRef.current.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          const aRandom = Math.random();
          //create shader material
          // console.log(child.geometry);
          // child.geometry.addGroup(0, 10, 0);
          // child.geometry.addGroup(0, 10, 1);
          // const materialArray = [createShaderMaterial(aRandom), material1];
          // child.material = materialArray;
          //child.material = createShaderMaterial(aRandom);

          matcapTextureRef.current.colorSpace = THREE.SRGBColorSpace;
          const matCapMaterial = new THREE.MeshMatcapMaterial({
            matcap: matcapTextureRef.current,
          });
          child.material = matCapMaterial;
          // child.position.y = 1;
          child.userData = { randomValue: aRandom };
        }
      });
    }
  }

  const amplitude = 50.0;
  const frequency = 0.2;
  const initialYPosition = -0.01;
  function animateGreenBlockPositions(time) {
    if (greenObjectsRef.current != null) {
      greenObjectsRef.current.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.position.y =
            initialYPosition -
            Math.sin(time * frequency * 12.0 * child.userData.randomValue) /
              amplitude;
        }
      });
    }
  }

  function insertTimeInShader(value) {
    if (greenObjectsRef.current != null) {
      greenObjectsRef.current.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material.uniforms) {
          child.material.uniforms.time.value = value;
          console.log(value);
        }
      });
    }
  }

  async function setupScene(canvas) {
    stats = new Stats();
    document.body.appendChild(stats.dom);
    //Scene is container for objects, cameras, and lights
    sceneRef.current = new THREE.Scene();

    rendererRef.current = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      // antialias: true,
    });

    rendererRef.current.setSize(window.innerWidth, window.innerHeight);

    // Create a camera and set its position and orientation
    cameraRef.current = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      1,
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

    new RGBELoader()
      .setPath("/env_map/")
      .load("satara_night_1k.hdr", function (texture) {
        texture.mapping = THREE.EquirectangularReflectionMapping;
        //sceneRef.current.background = texture;
        sceneRef.current.environment = texture;
      });

    // shaderMaterial = new THREE.ShaderMaterial({
    //   uniforms: {
    //     time: { value: 1.0 },
    //     resolution: { value: new THREE.Vector2() },
    //     aRandom: { value: aRandomValue },
    //   },

    //   vertexShader: cubeVertex,
    //   fragmentShader: cubeFragment,
    // });

    const textureLoader = new THREE.TextureLoader();
    matcapTextureRef.current = textureLoader.load(
      "/textures/matcap_texture_09.png"
    );

    const loader = new GLTFLoader();

    loader.load("/models/normal map grid9 updated.glb", (gltf) => {
      baseCubeRef.current = gltf.scene;
      baseCubeRef.current.position.set(0, -5, 0);
      sceneRef.current.add(baseCubeRef.current);

      greenObjectsRef.current = sceneRef.current.getObjectByName("blocks");

      animateGreen();

      // Now that the base cube is loaded, create the InstancedMesh
      // let mat = new THREE.MeshStandardMaterial({});
      // let rows = 2;
      // let count = rows * rows;

      // let random = new Float32Array(count);
      // instancedMeshRef.current = new THREE.InstancedMesh(
      //   baseCubeRef.current.children[0].geometry, // Use the geometry of the loaded cube
      //   shaderMaterial,
      //   count
      // );

      // if (instancedMeshRef.current.parent != sceneRef.current) {
      //   sceneRef.current.add(instancedMeshRef.current);
      // }

      // let index = 0;
      // //   for (let i = 0; i < rows; i++) {
      // //     for (let j = 0; j < rows; j++) {
      // //       random[index] = Math.random();
      // //       dummy.position.set(i - rows / 2, -5, j - rows / 2);
      // //       dummy.updateMatrix();
      // //       instancedMeshRef.current.setMatrixAt(index++, dummy.matrix);
      // //     }
      // //   }
      // let spacing = 2; // Adjust this value to increase or decrease spacing
      // let xSpacing = 1.73;
      // let ySpacing = 1.5;
      // for (let i = 0; i < rows; i++) {
      //   for (let j = 0; j < rows; j++) {
      //     random[index] = Math.random();
      //     if (j % 2 == 1) {
      //       dummy.position.set(
      //         0.865 + i * xSpacing - (rows * xSpacing) / 2,
      //         -5,
      //         j * ySpacing - (rows * ySpacing) / 2
      //       );
      //     } else {
      //       dummy.position.set(
      //         i * xSpacing - (rows * xSpacing) / 2,
      //         -5,
      //         j * ySpacing - (rows * ySpacing) / 2
      //       );
      //     }

      //     // dummy.position.set(j + xSpacing, -5, i * ySpacing);

      //     dummy.updateMatrix();
      //     instancedMeshRef.current.setMatrixAt(index++, dummy.matrix);
      //     // console.log(instancedMeshRef.current);
      //   }
      // }
      // instancedMeshRef.current.instanceMatrix.needsUpdate = true;

      // instancedMeshRef.current.geometry.setAttribute(
      //   "aRandom",
      //   new THREE.InstancedBufferAttribute(random, 1)
      // );
    });

    const composer = new EffectComposer(rendererRef.current);

    //ssrPass
    const ssrPass = new SSRPass({
      thickness: 0.001,
      maxDistance: 10,
      renderer: rendererRef.current,
      scene: sceneRef.current,
      camera: cameraRef.current,
      width: window.innerWidth,
      height: window.innerHeight,
      // groundReflector: params.groundReflector ? groundReflector : null,
      //selects: params.groundReflector ? selects : null,
    });

    //bloomPass parameters
    const bloomParameters = {
      threshold: 0.5,
      strength: 0.08,
      radius: 0.2,
      exposure: 0.1,
    };

    //bloomPass
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(canvasRef.current.width, canvasRef.current.height),
      0.1, //intensity
      0.05, //radius
      0.1 //
    );
    bloomPass.threshold = bloomParameters.threshold;
    bloomPass.strength = bloomParameters.strength;
    bloomPass.radius = bloomParameters.radius;
    bloomPass.renderToScreen = true;

    //taa pass
    taaRenderPassRef.current = new TAARenderPass(
      sceneRef.current,
      cameraRef.current
    );
    taaRenderPassRef.current.unbiased = false;
    taaRenderPassRef.current.sampleLevel = 2;

    composer.addPass(ssrPass);
    composer.addPass(taaRenderPassRef.current);
    // composer.addPass(bloomPass);
    composer.addPass(new OutputPass());

    // Animate the scene
    let time = 0;
    var clock = new THREE.Clock();
    var delta = 0;

    function animate() {
      requestAnimationFrame(animate);

      stats.update();

      time += 0.05;
      delta = clock.getDelta();
      // shaderMaterial.uniforms.time.value = time;
      insertTimeInShader(time);
      animateGreenBlockPositions(time);

      controlsRef.current.update();
      composer.render();
      //rendererRef.current.render(sceneRef.current, cameraRef.current);
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
