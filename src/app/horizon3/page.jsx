"use client";

import { useRef, useState, useEffect } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import cubeVertex from "../lib/shaders/cubeVertex.glsl";
import cubeFragment from "../lib/shaders/cubeFragment.glsl";

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
  let stats = null;
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);

  const baseCubeRef = useRef(null);
  const instancedMeshRef = useRef(null);
  let dummy = new THREE.Object3D();
  let timeUniform = { value: 0.0 };

  const taaRenderPassRef = useRef(null);

  let rotationAngleJS = { value: 0.0 };
  let scaleJS = { value: 2.0 };

  const matcapTextureRef = useRef(null);

  async function setupScene(canvas) {
    stats = new Stats();
    document.body.appendChild(stats.dom);
    //Scene is container for objects, cameras, and lights
    sceneRef.current = new THREE.Scene();

    rendererRef.current = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
    });

    rendererRef.current.shadowMap.enabled = true;
    rendererRef.current.shadowMap.type = THREE.VSMShadowMap;

    rendererRef.current.setSize(window.innerWidth, window.innerHeight);

    // Create a camera and set its position and orientation
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

    // Add the camera to the scene
    sceneRef.current.add(cameraRef.current);

    sceneRef.current.fog = new THREE.Fog(0x99ddff, 500, 1000);

    const dlight = new THREE.DirectionalLight(0xffffff, 1);

    dlight.position.set(200, 1000, 50);
    dlight.position.set(200, 1000, 50);
    sceneRef.current.add(dlight);

    const helper = new THREE.DirectionalLightHelper(dlight, 5);
    sceneRef.current.add(helper);

    //dlight.castShadow = true;

    // const spotLight = new THREE.SpotLight(0xffffff, 10000);
    // spotLight.position.set(50, 100, 50);
    // spotLight.penumbra = 0.5;
    // spotLight.angle = (Math.PI / 180) * 45;
    // sceneRef.current.add(spotLight);
    // //spotLight.castShadow = true;
    // spotLight.shadow.camera.left = -5000;
    // spotLight.shadow.camera.right = 5000;
    // spotLight.shadow.camera.top = 5000;
    // spotLight.shadow.camera.bottom = -5000;
    // spotLight.shadow.camera.far = 2000;

    // spotLight.shadow.bias = -0.01;

    // spotLight.shadow.camera.updateProjectionMatrix();

    // const spotLightHelper = new THREE.SpotLightHelper(spotLight);
    // sceneRef.current.add(spotLightHelper);

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.1);
    hemiLight.position.set(0, 0.116, 0);
    sceneRef.current.add(hemiLight);

    // const dLight = new THREE.DirectionalLight(0xffffff, 2);
    // dLight.position.set(5.0, 10.0, 7.5);
    // sceneRef.current.add(dLight);
    // // dLight.castShadow = true;

    // const light = new THREE.PointLight(0xff0000, 1, 100);
    // light.position.set(10, 10, 10);
    // sceneRef.current.add(light);

    // RectAreaLightUniformsLib.init();
    // const width = 1000;
    // const height = 1000;
    // const intensity = 10;
    // const rectLight = new THREE.RectAreaLight(
    //   0xffffff,
    //   intensity,
    //   width,
    //   height
    // );
    // rectLight.position.set(5, 50, 0);
    // rectLight.rotation.x = (Math.PI / 180) * 90;
    // rectLight.lookAt(0, 0, 0);
    // sceneRef.current.add(rectLight);

    // const rectLightHelper = new RectAreaLightHelper(rectLight);
    // rectLight.add(rectLightHelper);

    // const dLight2 = new THREE.DirectionalLight(0xffffff, 2);
    // dLight2.position.set(5.0, 10.0, -7.5);
    // sceneRef.current.add(dLight2);

    // dLight.shadow.mapSize.width = 1024; // default
    // dLight.shadow.mapSize.height = 1024; // default
    // dLight.shadow.camera.near = 0.5; // default
    // dLight.shadow.camera.far = 500;

    new RGBELoader()
      .setPath("/env_map/")
      .load("kloppenheim_02_puresky_1k.hdr", function (texture) {
        texture.mapping = THREE.EquirectangularReflectionMapping;
        sceneRef.current.background = texture;
        //sceneRef.current.environment = texture;
        const vec = new THREE.Vector3(0, (Math.PI / 180) * 90, 0);
        sceneRef.current.environmentRotation = vec;
        sceneRef.current.backgroundRotation = vec;
      });

    // const shaderMaterial = new THREE.ShaderMaterial({
    //   uniforms: {
    //     time: { value: 1.0 },
    //     resolution: { value: new THREE.Vector2() },
    //   },

    //   vertexShader: cubeVertex,
    //   fragmentShader: cubeFragment,
    // });

    const loader = new GLTFLoader();

    loader.load("/models/hexa_eith_edge_AO.glb", (gltf) => {
      console.log(gltf);
      //hexagon_b.glb
      baseCubeRef.current = gltf.scene;
      //baseCubeRef.current.position.set(0, -5, 0);
      //sceneRef.current.add(baseCubeRef.current);

      const textureLoader = new THREE.TextureLoader();
      matcapTextureRef.current = textureLoader.load(
        "/textures/matcap_texture_04.png"
      );

      const aoTexture = textureLoader.load("/texture_maps/ao_map.jpg");
      aoTexture.flipY = false;

      matcapTextureRef.current.colorSpace = THREE.SRGBColorSpace;
      let matCapMaterial = new THREE.MeshMatcapMaterial({
        matcap: matcapTextureRef.current,
      });

      // const plane = new THREE.PlaneGeometry(100, 100);
      // const planeMat = new THREE.MeshStandardMaterial({
      //   side: THREE.DoubleSide,
      // });
      // const planeMesh = new THREE.Mesh(plane, planeMat);
      // planeMesh.position.set(0, -5, 0);
      // planeMesh.rotation.x = (Math.PI / 180) * 90;
      // planeMesh.castShadow = true;
      // planeMesh.receiveShadow = true;
      // sceneRef.current.add(planeMesh);

      // const planeMesh2 = new THREE.Mesh(plane, planeMat);
      // planeMesh2.position.set(0, 10, 0);
      // planeMesh2.rotation.x = (Math.PI / 180) * 90;
      // planeMesh2.castShadow = true;
      // planeMesh2.receiveShadow = true;
      // sceneRef.current.add(planeMesh2);

      // Now that the base cube is loaded, create the InstancedMesh
      let mat = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        roughness: 1,
        aoMap: aoTexture,
      });

      let uniforms = {
        rotationAngle: rotationAngleJS,
        vScale: scaleJS,
        time: timeUniform,
        uFBO: {
          value: new THREE.TextureLoader().load("/images/metavian-logo.png"),
        },
      };

      let rows = 250;
      let count = rows * rows;

      let random = new Float32Array(count);

      let instanceUV = new Float32Array(count * 2);
      instancedMeshRef.current = new THREE.InstancedMesh(
        baseCubeRef.current.children[0].geometry, // Use the geometry of the loaded cube
        mat,
        count
      );

      instancedMeshRef.current.castShadow = true;
      instancedMeshRef.current.receiveShadow = true;

      if (instancedMeshRef.current.parent != sceneRef.current) {
        sceneRef.current.add(instancedMeshRef.current);
      }

      let index = 0;
      let spacing = 2; // Adjust this value to increase or decrease spacing
      let xSpacing = 2; // original 1.73  // 2
      let ySpacing = 1.73; // original 1.5   // 1.73
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
          instanceUV.set([i / rows, j / rows], (i * rows + j) * 2);
          //instanceUV.set([i / rows, j / rows], i * rows + j * 2);
          //instanceUV.set(i / rows, j / rows);

          dummy.updateMatrix();
          instancedMeshRef.current.setMatrixAt(index++, dummy.matrix);
        }
      }
      instancedMeshRef.current.instanceMatrix.needsUpdate = true;

      instancedMeshRef.current.geometry.setAttribute(
        "aRandom",
        new THREE.InstancedBufferAttribute(random, 1)
      );
      instancedMeshRef.current.geometry.setAttribute(
        "instanceUV",
        new THREE.InstancedBufferAttribute(instanceUV, 2)
      );

      mat.onBeforeCompile = (shader) => {
        shader.uniforms = Object.assign(shader.uniforms, uniforms);
        shader.vertexShader = shader.vertexShader.replace(
          "#include <common>",
          `
          uniform sampler2D uFBO;
          uniform float time;
          uniform vec3 light_color;
          varying vec4 mvPosition;
          varying vec3 vPosition;
          varying vec3 uvHeight;
          varying float vHeight;

          attribute vec2 instanceUV;
          attribute float aRandom;
          uniform float rotationAngle;
          uniform float vScale;
          `
        );
        shader.vertexShader = shader.vertexShader.replace(
          "#include <begin_vertex>",
          `
          #include <begin_vertex>

          float bottom_level = 0.1;
          float crest = 100.0;
          float amplitude = 100.0;
          float start_level = 5.0;
          
          float angle = rotationAngle * 3.14159265/180.0;
          vec2 pivot = vec2(0.5, 0.4); 
          vec2 centeredUV = instanceUV - pivot;
          

          // Scaling
          float scale = vScale; // Change this to your desired scaling factor
          vec2 scaledUV = centeredUV * scale;
    
          // Rotation
          vec2 rotatedUV = vec2(
          scaledUV.x * cos(angle) - scaledUV.y * sin(angle),
          scaledUV.x * sin(angle) + scaledUV.y * cos(angle)
          );

          vec2 newUV = rotatedUV + pivot;
          vec4 transition = texture2D(uFBO, newUV);

          //transformed *= transition.g;
          

          float vAmplitude = (aRandom + sin(time + 25.0 * aRandom) + start_level) * transition.g * crest; 
          float normalized_vAmplitude = clamp((vAmplitude - bottom_level) / (crest - bottom_level), 0.0, crest);

          transformed.y += normalized_vAmplitude;
          //transformed.y += (aRandom + sin(time + 25.0 * aRandom) + 0.0) * transition.g * 2.0; 

          
          //transformed.y = 15.0 + (2.0 * transition.g);

          // mvPosition = modelMatrix * vec4(position, 1.0) * instanceMatrix;
          // mvPosition = viewMatrix * mvPosition;
          // mvPosition.y += (aRandom + sin(time + 15.0 * aRandom)) * transition.g * 15.0;
          
          // gl_Position = projectionMatrix * mvPosition;

          vHeight = transformed.y;

          //uvHeight = clamp(transformed.y, 1.0, 0.0);
          `
        );
        // shader.fragmentShader = shader.fragmentShader.replace(
        //   "#include <common>",
        //   `
        //   #include <common>
        //   varying vec3 uvHeight;
        //   varying float vHeight;
        //   varying vec4 mvPosition;
        //   `
        // );
        // shader.fragmentShader = shader.fragmentShader.replace(
        //   "#include <color_fragment>",
        //   `
        //   #include <color_fragment>
        //   // Define the expected range of vHeight values
        //   const float minHeight = 0.0;
        //   const float maxHeight = 1.0; // Adjust based on your specific range

        //   // Normalize vHeight between 0 and 1
        //   float normalized_vHeight = clamp((vHeight - minHeight) / (maxHeight - minHeight), 0.0, 1.0);

        //   float color1 = diffuseColor.r;
        //   if (normalized_vHeight > 0.0) {
        //     //color1 = 0.0;
        //     //color1 =+ normalized_vHeight * 2.0;
        //     //diffuseColor.rgb = vec3(0.0, (normalized_vHeight - 0.5), 0.0);

        //     diffuseColor.rgb = vec3(1.0, 0.0, 0.0);
        //   }
        //   //diffuseColor.rgb = vec3(color1, diffuseColor.g, diffuseColor.b);
        //   `
        // );
      };
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
    //composer.addPass(taaRenderPassRef.current);
    //composer.addPass(bloomPass);
    composer.addPass(new OutputPass());

    // Animate the scene
    let time = 0;
    function animate() {
      stats.update();
      requestAnimationFrame(animate);

      time += 0.01;
      //shaderMaterial.uniforms.time.value = time;
      timeUniform.value = time;

      controlsRef.current.update();
      //composer.render();
      rendererRef.current.render(sceneRef.current, cameraRef.current);
    }
    animate();
  }

  useEffect(() => {
    let isMounted = true;
    setupScene();
  }, []);

  function onRotationChange(value) {
    rotationAngleJS.value = value;
    console.log(rotationAngleJS.value);
  }
  function onScaleChange(value) {
    scaleJS.value = value;
    console.log(value);
  }

  return (
    <div className="container">
      <div className={styles.slidecontainer}>
        <p>rotation</p>
        <input
          type="range"
          min="0"
          max="360"
          step="1"
          onChange={(e) => onRotationChange(e.target.value)}
        ></input>

        <p>scale</p>
        <input
          type="range"
          min="0.1"
          max="10"
          step="0.01"
          className="slider"
          id="myRange"
          onChange={(e) => onScaleChange(e.target.value)}
        ></input>
      </div>
      <canvas id="canvas" className="canvas" ref={canvasRef}></canvas>
    </div>
  );
}
