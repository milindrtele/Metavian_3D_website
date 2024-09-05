"use client";

import { useRef, useState, useEffect } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import TWEEN from "@tweenjs/tween.js";
import fboVertex from "../lib/shaders/fbo/fboVertex.glsl";
import fboFragment from "../lib/shaders/fbo/fboFragment.glsl";

import testVertex from "../lib/shaders/test/testVertex.glsl";
import testFragment from "../lib/shaders/test/testFragment.glsl";

import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { SSRPass } from "three/addons/postprocessing/SSRPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { TAARenderPass } from "three/addons/postprocessing/TAARenderPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";

import { RGBELoader } from "three/addons/loaders/RGBELoader.js";

import { RectAreaLightHelper } from "three/addons/helpers/RectAreaLightHelper.js";
import { RectAreaLightUniformsLib } from "three/addons/lights/RectAreaLightUniformsLib.js";

import Stats from "three/addons/libs/stats.module.js";

import styles from "./page.module.css";

export default function Horizon() {
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);

  const baseCubeRef = useRef(null);
  const instancedMeshRef = useRef(null);
  const instancedMesh2Ref = useRef(null);
  let dummy = new THREE.Object3D();
  let dummy2 = new THREE.Object3D();
  let timeUniform = { value: 0.0 };

  const taaRenderPassRef = useRef(null);

  let overallAnimationLevelJS = { value: 1.0 };
  let rotationAngleJS = { value: 180.0 };
  let scaleJS = { value: 2.0 };
  let scaleRingJS = { value: 100.0 };
  let progressJS = { value: 0.0 };

  const matcapTextureRef = useRef(null);

  // fbo scene
  const fboRef = useRef(null);
  let fboCamera = null;
  let fboScene = null;
  let fboMaterial = null;
  let fboGeo = null;
  let fboMesh = null;

  function setupFBO() {
    fboRef.current = new THREE.WebGLRenderTarget(1000, 1000);
    fboCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
    fboCamera.position.z = 1;
    fboScene = new THREE.Scene();
    fboMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: timeUniform,
        uFBO: { value: null },
        uProgress: progressJS,
        step1: {
          value: new THREE.TextureLoader().load("/images/metavian-logo.png"),
        },
        step2: {
          value: new THREE.TextureLoader().load("/images/ring2.jpg"),
        },
        step3: {
          value: new THREE.TextureLoader().load("/images/images.png"),
        },
      },
      vertexShader: fboVertex,
      fragmentShader: fboFragment,
    });
    fboGeo = new THREE.PlaneGeometry(2, 2);
    fboMesh = new THREE.Mesh(fboGeo, fboMaterial);
    fboScene.add(fboMesh);
  }

  async function setupScene(canvas) {
    // Setup stats
    const stats = new Stats();
    document.body.appendChild(stats.dom);

    // Initialize scene, renderer, and camera
    sceneRef.current = new THREE.Scene();
    rendererRef.current = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
    });
    rendererRef.current.setSize(window.innerWidth, window.innerHeight);
    cameraRef.current = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    cameraRef.current.position.set(0, 0, 100);
    controlsRef.current = new OrbitControls(
      cameraRef.current,
      rendererRef.current.domElement
    );

    sceneRef.current.add(cameraRef.current);
    sceneRef.current.fog = new THREE.Fog(0x99ddff, 500, 1000);

    // Lighting
    const spotLightParent = new THREE.Object3D();
    spotLightParent.position.set(0, 0, 0);
    sceneRef.current.add(spotLightParent);

    const spotlight1 = new THREE.SpotLight(0xffffff, 100000);
    spotlight1.position.set(100, 100, 100);
    spotlight1.penumbra = 0.5;
    spotlight1.angle = (Math.PI / 180) * 25;
    const spotlight2 = new THREE.SpotLight(0xffffff, 100000);
    spotlight2.position.set(-100, 100, 100);
    spotlight2.penumbra = 0.5;
    spotlight2.angle = (Math.PI / 180) * 25;
    const spotlight3 = new THREE.SpotLight(0xffffff, 100000);
    spotlight3.position.set(0, 100, -100);
    spotlight3.penumbra = 0.5;
    spotlight3.angle = (Math.PI / 180) * 25;

    spotLightParent.add(spotlight1);
    spotLightParent.add(spotlight2);
    spotLightParent.add(spotlight3);

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.01);
    hemiLight.position.set(0, 0.116, 0);
    sceneRef.current.add(hemiLight);

    // FBO debug planes
    const debugPlaneGeo = new THREE.PlaneGeometry(20, 20);
    const debugPlaneMat = new THREE.MeshBasicMaterial({
      map: fboRef.current.texture,
      side: THREE.DoubleSide,
    });
    const debugPlaneMesh = new THREE.Mesh(debugPlaneGeo, debugPlaneMat);
    debugPlaneMesh.position.set(0, 20, 0);
    sceneRef.current.add(debugPlaneMesh);

    const debugPlane2Geo = new THREE.PlaneGeometry(20, 20);
    const debugPlane2Mat = new THREE.ShaderMaterial({
      uniforms: {
        time: timeUniform,
        uFBO: { value: fboRef.current.texture },
        uProgress: progressJS,
        step1: {
          value: new THREE.TextureLoader().load("/images/metavian-logo.png"),
        },
        step2: {
          value: new THREE.TextureLoader().load("/images/ring2.jpg"),
        },
        step3: {
          value: new THREE.TextureLoader().load("/images/images.png"),
        },
      },
      vertexShader: fboVertex,
      fragmentShader: fboFragment,
    });
    debugPlane2Mat.side = THREE.DoubleSide;
    const debugPlane2Mesh = new THREE.Mesh(debugPlane2Geo, debugPlane2Mat);
    debugPlane2Mesh.position.set(30, 20, 0);
    sceneRef.current.add(debugPlane2Mesh);

    // Load and setup GLTF model
    const loader = new GLTFLoader();
    loader.load("/models/hexa_eith_edge_AO_3.glb", (gltf) => {
      baseCubeRef.current = gltf.scene;
      const textureLoader = new THREE.TextureLoader();
      matcapTextureRef.current = textureLoader.load(
        "/textures/matcap_texture_04.png"
      );

      const aoTexture = textureLoader.load("/texture_maps/ao_map.jpg");
      aoTexture.flipY = false;
      matcapTextureRef.current.colorSpace = THREE.SRGBColorSpace;

      const mat = new THREE.MeshPhysicalMaterial({
        color: 0x363636,
        roughness: 0.1,
        aoMap: aoTexture,
      });
      const mat2 = new THREE.MeshPhysicalMaterial({
        color: 0x363636,
        roughness: 0.1,
        aoMap: aoTexture,
      });

      const uniformsForGrid = {
        overallAnimationLevel: overallAnimationLevelJS,
        rotationAngle: rotationAngleJS,
        vScale: scaleJS,
        vScaleRing: scaleRingJS,
        time: timeUniform,
        uFBO: { value: fboRef.current.texture },
      };

      const rows = 200;
      const count = rows ** 2;
      const originalGeometry = baseCubeRef.current.children[0].geometry;

      const instancedMesh = new THREE.InstancedMesh(
        originalGeometry,
        mat,
        count
      );
      instancedMesh.castShadow = true;
      instancedMesh.receiveShadow = true;
      instancedMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

      instancedMesh2Ref.current = new THREE.InstancedMesh(
        originalGeometry,
        new THREE.ShaderMaterial({
          vertexShader: testVertex,
          fragmentShader: testFragment,
          uniforms: uniformsForGrid,
          side: THREE.DoubleSide,
        }),
        count
      );

      const separation = 2;
      let i = 0;
      for (let x = 0; x < rows; x++) {
        for (let z = 0; z < rows; z++) {
          dummy.position.set(
            separation * (x - rows / 2),
            0,
            separation * (z - rows / 2)
          );
          dummy.updateMatrix();
          instancedMesh.setMatrixAt(i, dummy.matrix);
          instancedMesh2Ref.current.setMatrixAt(i, dummy.matrix);
          i++;
        }
      }

      sceneRef.current.add(instancedMesh);
      sceneRef.current.add(instancedMesh2Ref.current);
    });

    // Post-processing
    // const renderPass = new THREE.RenderPass(
    //   sceneRef.current,
    //   cameraRef.current
    // );
    // const ssrPass = new SSRPass({
    //   renderer: rendererRef.current,
    //   scene: sceneRef.current,
    //   camera: cameraRef.current,
    //   width: innerWidth,
    //   height: innerHeight,
    //   groundReflector: null,
    //   selects: sceneRef.current.children,
    // });
    // const bloomPass = new UnrealBloomPass(
    //   new THREE.Vector2(window.innerWidth, window.innerHeight),
    //   0.01,
    //   0.01,
    //   0.01
    // );

    // taaRenderPassRef.current = new TAARenderPass(
    //   sceneRef.current,
    //   cameraRef.current
    // );
    // taaRenderPassRef.current.unbiased = false;

    // const outputPass = new OutputPass(THREE.NoToneMapping);

    // const composer = new EffectComposer(rendererRef.current);
    // composer.addPass(renderPass);
    // composer.addPass(ssrPass);
    // composer.addPass(bloomPass);
    // composer.addPass(taaRenderPassRef.current);
    // composer.addPass(outputPass);

    // Animation loop
    function animate() {
      requestAnimationFrame(animate);

      timeUniform.value += 0.01;

      rendererRef.current.setRenderTarget(fboRef.current);
      rendererRef.current.render(fboScene, fboCamera);

      rendererRef.current.setRenderTarget(null);

      // composer.render();
      rendererRef.current.render(sceneRef.current, cameraRef.current);
      stats.update();
    }

    animate();
  }

  useEffect(() => {
    const canvas = canvasRef.current;

    setupFBO();
    setupScene(canvas);

    window.addEventListener("resize", () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      rendererRef.current.setSize(width, height);
      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
    });

    return () => {
      window.removeEventListener("resize", () => {
        const width = window.innerWidth;
        const height = window.innerHeight;
        rendererRef.current.setSize(width, height);
        cameraRef.current.aspect = width / height;
        cameraRef.current.updateProjectionMatrix();
      });
    };
  }, []);

  return (
    <main className={styles.main}>
      <div className={styles.description}>
        <p>My Horizon</p>
      </div>
      <div className={styles.center}>
        <canvas ref={canvasRef} />
      </div>
    </main>
  );
}
