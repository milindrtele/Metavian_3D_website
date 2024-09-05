"use client";

import { useRef, useState, useEffect } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import TWEEN from "@tweenjs/tween.js";
import fboVertex from "../lib/shaders/fbo/fboVertex.glsl";
import fboFragment from "../lib/shaders/fbo/fboFragment.glsl";

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
import { mat2 } from "three/examples/jsm/nodes/Nodes";

export default function Horizon() {
  let stats = null;
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);

  const uniformsRef = useRef(null);

  const baseCubeRef = useRef(null);
  const instancedMeshRef = useRef(null);
  const instancedMesh2Ref = useRef(null);
  let dummy = new THREE.Object3D();
  let dummy2 = new THREE.Object3D();
  let timeUniform = { value: 0.0 };

  const taaRenderPassRef = useRef(null);

  let overallAnimationLevelJS = { value: 1.0 };
  let rotationAngleJS = { value: 0.0 };
  let scaleJS = { value: 2.0 };
  let scaleRingJS = { value: 100.0 };
  let progressJS = { value: 0.5 };

  const matcapTextureRef = useRef(null);

  // fbo scene
  const fboRef = useRef(null);
  //const [fbo, setfbo] = useState(null);
  //let fbo = null;
  let fboCamera = null;
  let fboScene = null;
  let fboMaterial = null;
  let fboGeo = null;
  let fboMesh = null;

  const fboCameraRef = useRef(null);
  const fboSceneRef = useRef(null);
  const fboMaterialRef = useRef(null);
  const fboGeoRef = useRef(null);
  const fboMeshRef = useRef(null);

  //let debugPlaneMesh2 = null;
  const debugPlaneMesh2Ref = useRef(null);

  const stage1Ref = useRef(null);
  const stage2Ref = useRef(null);
  const stage3Ref = useRef(null);

  // function loadTextures() {
  //   stage1Ref.current = new THREE.TextureLoader().load(
  //     "/images/metavian-logo.png"
  //   );
  //   stage2Ref.current = new THREE.TextureLoader().load("/images/ring2.jpg");
  //   stage3Ref.current = new THREE.TextureLoader().load("/images/images.png");
  // }

  // function setupFBO() {
  //   fbo = new THREE.WebGL3DRenderTarget(1000, 1000);
  //   fboCamera = new THREE.OrthographicCamera({});
  //   fboScene = new THREE.Scene();
  //   fboMaterial = new THREE.ShaderMaterial({
  //     uniforms: {
  //       time: timeUniform,
  //       uFBO: null,
  //       uProgress: progressJS,
  //       step1: {
  //         value: stage1Ref.current,
  //       },
  //       step2: {
  //         value: stage2Ref.current,
  //       },
  //       step3: {
  //         value: stage3Ref.current,
  //       },
  //     },
  //     vertexShader: fboVertex,
  //     fragmentShader: fboFragment,
  //   });
  //   fboGeo = new THREE.PlaneGeometry(2, 2);
  //   fboMesh = new THREE.Mesh(fboGeo, fboMaterial);
  //   fboScene.add(fboMesh);
  // }

  function loadTextures() {
    return new Promise((resolve, reject) => {
      const loader = new THREE.TextureLoader();
      let loadedTextures = 0;
      const totalTextures = 3;

      const checkIfAllLoaded = () => {
        loadedTextures++;
        if (loadedTextures === totalTextures) {
          resolve();
        }
      };

      loader.load(
        "/images/metavian-logo.png",
        (texture) => {
          stage1Ref.current = texture;
          checkIfAllLoaded();
        },
        undefined,
        reject
      );

      loader.load(
        "/images/ring2.jpg",
        (texture) => {
          stage2Ref.current = texture;
          checkIfAllLoaded();
        },
        undefined,
        reject
      );

      loader.load(
        "/images/images.png",
        (texture) => {
          stage3Ref.current = texture;
          checkIfAllLoaded();
        },
        undefined,
        reject
      );
    });
  }

  function setupFBO() {
    fboRef.current = new THREE.WebGLRenderTarget(1000, 1000);
    fboCameraRef.current = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
    fboSceneRef.current = new THREE.Scene();
    fboMaterialRef.current = new THREE.ShaderMaterial({
      uniforms: {
        time: timeUniform,
        uFBO: null,
        uProgress: progressJS,
        step1: {
          value: stage1Ref.current,
        },
        step2: {
          value: stage2Ref.current,
        },
        step3: {
          value: stage3Ref.current,
        },
      },
      vertexShader: fboVertex,
      fragmentShader: fboFragment,
    });
    fboGeoRef.current = new THREE.PlaneGeometry(2, 2);
    fboMeshRef.current = new THREE.Mesh(
      fboGeoRef.current,
      fboMaterialRef.current
    );
    fboSceneRef.current.add(fboMeshRef.current);
    console.log(fboRef.current);
  }

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
    cameraRef.current.position.set(0, 0, 100);
    controlsRef.current = new OrbitControls(
      cameraRef.current,
      rendererRef.current.domElement
    );

    // Add the camera to the scene
    sceneRef.current.add(cameraRef.current);

    sceneRef.current.fog = new THREE.Fog(0x99ddff, 500, 1000);

    loadTextures()
      .then(() => {
        console.log("images are loaded");
        setupFBO();
      })
      .catch((error) => {
        console.error("Error loading textures:", error);
      });

    const spotLightParent = new THREE.Object3D();
    spotLightParent.position.set(0, 0, 0);
    sceneRef.current.add(spotLightParent);
    //spotlight1
    const spotlight1 = new THREE.SpotLight(0xffffff, 100000);
    spotlight1.position.set(100, 100, 100);
    spotlight1.penumbra = 0.5;
    spotlight1.angle = (Math.PI / 180) * 25;
    //spotlight2
    const spotlight2 = new THREE.SpotLight(0xffffff, 100000);
    spotlight2.position.set(-100, 100, 100);
    spotlight2.penumbra = 0.5;
    spotlight2.angle = (Math.PI / 180) * 25;
    //spotlight3
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

    // new RGBELoader()
    //   .setPath("/env_map/")
    //   .load("kloppenheim_02_puresky_1k.hdr", function (texture) {
    //     texture.mapping = THREE.EquirectangularReflectionMapping;
    //     sceneRef.current.background = texture;
    //     sceneRef.current.environment = texture;
    //     const vec = new THREE.Vector3(0, (Math.PI / 180) * 90, 0);
    //     sceneRef.current.environmentRotation = vec;
    //     sceneRef.current.backgroundRotation = vec;
    //   });

    //

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
      // stats.update();
      // requestAnimationFrame(animate);

      // time += 0.01;
      // //shaderMaterial.uniforms.time.value = time;
      // timeUniform.value = time;

      // spotLightParent.rotation.y += 0.01;
      // controlsRef.current.update();

      // TWEEN.update();

      // //composer.render();
      // if (fboRef.current != null) {
      //   rendererRef.current.setRenderTarget(fboRef.current);
      //   rendererRef.current.render(fboSceneRef.current, fboCameraRef.current);
      // }

      // console.log(fboRef.current);
      // rendererRef.current.setRenderTarget(null);
      // if (uniformsRef.current != null && fboRef.current != null) {
      //   uniformsRef.current.uFBO.value = fboRef.current.texture;
      // }
      // rendererRef.current.render(sceneRef.current, cameraRef.current);

      stats.update();
      requestAnimationFrame(animate);

      time += 0.01;
      //shaderMaterial.uniforms.time.value = time;
      timeUniform.value = time;

      spotLightParent.rotation.y += 0.01;
      controlsRef.current.update();

      TWEEN.update();

      //composer.render();
      // if (fboRef.current != null) {
      //   rendererRef.current.setRenderTarget(fboRef.current);
      //   rendererRef.current.render(fboSceneRef.current, fboCameraRef.current);
      // }

      rendererRef.current.setRenderTarget(null);
      //if (uniformsRef.current != null)
      //uniformsRef.current.uFBO.value = fboRef.current.texture;
      rendererRef.current.render(sceneRef.current, cameraRef.current);
    }
    animate();
  }

  useEffect(() => {
    let isMounted = true;

    setupScene();
  }, []);

  useEffect(() => {
    if (fboRef.current != null) {
      const debugPlaneGeo = new THREE.PlaneGeometry(20, 20);
      const debugPlaneMat = new THREE.MeshBasicMaterial({
        //map: stage2Ref.current,
        //map: new THREE.TextureLoader().load("/images/images.png"),
        map: fboRef.current.texture,
        side: THREE.DoubleSide,
      });
      const debugPlaneMesh = new THREE.Mesh(debugPlaneGeo, debugPlaneMat);
      debugPlaneMesh.position.set(0, 20, 0);
      sceneRef.current.add(debugPlaneMesh);

      const debugPlaneGeo2 = new THREE.PlaneGeometry(30, 30);
      const debugPlaneMat2 = new THREE.ShaderMaterial({
        uniforms: {
          uProgress: { value: 0.0 },
        },
        vertexShader: fboVertex,
        fragmentShader: fboFragment,
      });
      debugPlaneMat2.side = THREE.DoubleSide;
      debugPlaneMesh2Ref.current = new THREE.Mesh(
        debugPlaneGeo2,
        debugPlaneMat2
      );
      debugPlaneMesh2Ref.current.position.set(30, 20, 0);
      sceneRef.current.add(debugPlaneMesh2Ref.current);
    }
  }, [fboRef.current]);

  useEffect(() => {
    if (fboRef.current) console.log(fboRef.current.texture);
  }, [fboRef.current]);

  useEffect(() => {
    if (fboRef.current != null) {
      console.log(fboRef.current.texture);
      const loader = new GLTFLoader();

      loader.load("/models/hexa_eith_edge_AO_3.glb", (gltf) => {
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

        // Now that the base cube is loaded, create the InstancedMesh
        let mat = new THREE.MeshPhysicalMaterial({
          color: 0x363636,
          roughness: 0.1,
          aoMap: aoTexture,
        });
        let mat2 = new THREE.MeshPhysicalMaterial({
          color: 0x363636,
          roughness: 0.1,
          aoMap: aoTexture,
        });

        uniformsRef.current = {
          overallAnimationLevel: overallAnimationLevelJS,
          rotationAngle: rotationAngleJS,
          vScale: scaleJS,
          vScaleRing: scaleRingJS,
          time: timeUniform,
          // uFBO: {
          //   value: new THREE.TextureLoader().load("/images/metavian-logo.png"),
          // },
          // uFBO2: {
          //   value: new THREE.TextureLoader().load("/images/ring2.jpg"),
          // },
          uFBO: {
            value: fboRef.current.texture,
          },
          uFBO2: {
            value: new THREE.TextureLoader().load("/images/ring2.jpg"),
          },
        };

        let rows = 200;
        let count = rows * rows;

        let random = new Float32Array(count);

        let instanceUV = new Float32Array(count * 2);
        let instance2UV = new Float32Array(count * 2);
        instancedMeshRef.current = new THREE.InstancedMesh(
          baseCubeRef.current.children[0].geometry, // Use the geometry of the loaded cube
          mat,
          count
        );
        instancedMesh2Ref.current = new THREE.InstancedMesh(
          baseCubeRef.current.children[1].geometry, // Use the geometry of the loaded cube
          mat2,
          count
        );

        // instancedMeshRef.current.castShadow = true;
        // instancedMeshRef.current.receiveShadow = true;

        if (instancedMeshRef.current.parent != sceneRef.current) {
          sceneRef.current.add(instancedMeshRef.current);
        }
        if (instancedMesh2Ref.current.parent != sceneRef.current) {
          sceneRef.current.add(instancedMesh2Ref.current);
        }

        // for (let i = 0; i < count; i++) {
        //   random[i] = Math.random();
        // }

        let index = 0;
        let spacing = 2; // Adjust this value to increase or decrease spacing
        let xSpacing = 2; // original 1.73  // 2
        let ySpacing = 1.73; // original 1.5   // 1.73
        let indexNo = 0;
        for (let i = 0; i < rows; i++) {
          for (let j = 0; j < rows; j++) {
            random[index] = Math.random();
            if (j % 2 == 1) {
              dummy.position.set(
                0.865 + i * xSpacing - (rows * xSpacing) / 2,
                -5,
                j * ySpacing - (rows * ySpacing) / 2
              );
              dummy2.position.set(
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
              dummy2.position.set(
                i * xSpacing - (rows * xSpacing) / 2,
                -5,
                j * ySpacing - (rows * ySpacing) / 2
              );
            }
            instanceUV.set([i / rows, j / rows], (i * rows + j) * 2);
            instance2UV.set([i / rows, j / rows], (i * rows + j) * 2);

            dummy.updateMatrix();
            dummy2.updateMatrix();
            instancedMeshRef.current.setMatrixAt(index, dummy.matrix);
            instancedMesh2Ref.current.setMatrixAt(index++, dummy2.matrix);
          }
        }
        instancedMeshRef.current.instanceMatrix.needsUpdate = true;
        instancedMesh2Ref.current.instanceMatrix.needsUpdate = true;

        instancedMeshRef.current.geometry.setAttribute(
          "aRandom",
          new THREE.InstancedBufferAttribute(random, 1)
        );
        instancedMeshRef.current.geometry.setAttribute(
          "instanceUV",
          new THREE.InstancedBufferAttribute(instanceUV, 2)
        );
        //
        instancedMesh2Ref.current.geometry.setAttribute(
          "aRandom",
          new THREE.InstancedBufferAttribute(random, 1)
        );
        instancedMesh2Ref.current.geometry.setAttribute(
          "instanceUV",
          new THREE.InstancedBufferAttribute(instanceUV, 2)
        );

        //
        mat.onBeforeCompile = (shader) => {
          shader.uniforms = Object.assign(shader.uniforms, uniformsRef.current);
          shader.vertexShader = shader.vertexShader.replace(
            "#include <common>",
            `
          uniform sampler2D uFBO;
          uniform sampler2D uFBO2;
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
          uniform float vScaleRing;
          uniform float overallAnimationLevel;
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
          

          float vAmplitude = (aRandom + sin(time + 25.0 * aRandom) + start_level) * transition.g * crest * overallAnimationLevel; 
          //float vAmplitude =  start_level * transition.g * crest * overallAnimationLevel;
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

        //

        mat2.onBeforeCompile = (shader) => {
          shader.uniforms = Object.assign(shader.uniforms, uniformsRef.current);
          shader.vertexShader = shader.vertexShader.replace(
            "#include <common>",
            `
          uniform sampler2D uFBO;
          uniform sampler2D uFBO2;
          uniform float time;
          uniform vec3 light_color;
          varying vec4 mvPosition;
          varying vec3 vPosition;
          varying vec3 uvHeight;
          varying float vHeight;
          varying float rValue;

          attribute vec2 instanceUV;
          attribute float aRandom;
          uniform float rotationAngle;
          uniform float vScale;
          uniform float vScaleRing;
          uniform float overallAnimationLevel;
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
          

          // Scaling for logo
          float scale = vScale; // Change this to your desired scaling factor
          vec2 scaledUV = centeredUV * scale;
    
          // Rotation for logo
          vec2 rotatedUV = vec2(
          scaledUV.x * cos(angle) - scaledUV.y * sin(angle),
          scaledUV.x * sin(angle) + scaledUV.y * cos(angle)
          );

          // Scaling for ring
          float scaleRing = vScaleRing; // Change this to your desired scaling factor
          vec2 scaledRingUV = centeredUV * scaleRing;
    
          // Rotation for ring
          vec2 rotatedRingUV = vec2(
          scaledRingUV.x * cos(angle) - scaledRingUV.y * sin(angle),
          scaledRingUV.x * sin(angle) + scaledRingUV.y * cos(angle)
          );

          vec2 newUV = rotatedUV + pivot;
          vec2 newRingUV = rotatedRingUV + pivot;
          vec4 transition = texture2D(uFBO, newUV);
          vec4 transition2 = texture2D(uFBO2, newRingUV);

          rValue = transition2.r;
          //transformed *= transition.g;
          

          float vAmplitude = (aRandom + sin(time + 25.0 * aRandom) + start_level) * transition.g * crest * overallAnimationLevel; 
          //float vAmplitude =  start_level * transition.g * crest * overallAnimationLevel;
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
          shader.fragmentShader = shader.fragmentShader.replace(
            "#include <common>",
            `
          #include <common>
          varying vec3 uvHeight;
          varying float vHeight;
          varying float rValue;
          varying vec4 mvPosition;
          `
          );
          shader.fragmentShader = shader.fragmentShader.replace(
            "#include <color_fragment>",
            `
          #include <color_fragment>
          // Define the expected range of vHeight values
          const float minHeight = 0.0;
          const float maxHeight = 1.0; // Adjust based on your specific range

          // Normalize vHeight between 0 and 1
          float normalized_vHeight = clamp((vHeight - minHeight) / (maxHeight - minHeight), 0.0, 1.0);

          float color1 = diffuseColor.r;
          if (normalized_vHeight > 0.5) {
            diffuseColor.rgb = vec3(1.0, 1.0, 1.0);
          }
          if(rValue > 0.0 && normalized_vHeight > 0.04){
            //diffuseColor.rgb = vec3(0.36, 0.16, 0.30);
            diffuseColor.rgb = vec3(1.0, 1.0, 1.0);
          }
          //diffuseColor.rgb = vec3(color1, diffuseColor.g, diffuseColor.b);
          `
          );
        };
      });
    }
  }, [fboRef.current]);

  useEffect(() => {
    // const overallAnimationLevelControl = new TWEEN.Tween(
    //   overallAnimationLevelJS
    // )
    //   .to({ value: 1.0 }, 5000)
    //   .onStart(() => {})
    //   .delay(4000)
    //   .onUpdate(() => {
    //     //console.log(scaleRingJS.value);
    //   })
    //   .onComplete(() => {
    //     //scaleRingJS.value = 100.0;
    //     const ringAnimation = new TWEEN.Tween(scaleRingJS)
    //       .to({ value: 0.0 }, 5000) // Animate the position directly
    //       .onStart(() => {})
    //       .onUpdate(() => {
    //         //console.log(scaleRingJS.value);
    //       })
    //       .onComplete(() => {
    //         //scaleRingJS.value = 100.0;
    //         const a = new TWEEN.Tween(scaleRingJS)
    //           .to({ value: 100.0 }, 5000) // Animate the position directly
    //           .onStart(() => {})
    //           .delay(2000)
    //           .onUpdate(() => {
    //             //console.log(scaleRingJS.value);
    //           })
    //           .onComplete(() => {
    //             const b = new TWEEN.Tween(overallAnimationLevelJS)
    //               .to({ value: 0.0 }, 5000) // Animate the position directly
    //               .onStart(() => {})
    //               .onUpdate(() => {
    //                 //console.log(scaleRingJS.value);
    //               })
    //               .onComplete(() => {
    //                 //scaleRingJS.value = 100.0;
    //                 //console.log(scaleRingJS.value);
    //                 // this.start();
    //               })
    //               .easing(TWEEN.Easing.Cubic.Out)
    //               //.repeat(Infinity)
    //               .start();
    //           })
    //           .easing(TWEEN.Easing.Cubic.Out)
    //           //.repeat(Infinity)
    //           .start();
    //       })
    //       .easing(TWEEN.Easing.Cubic.Out)
    //       //.repeat(Infinity)
    //       .start();
    //   })
    //   .easing(TWEEN.Easing.Cubic.Out)
    //   //.repeat(Infinity)
    //   .start();
    // ringAnimation.easing(TWEEN.Easing.Linear);
    // ringAnimation.repeat(Infinity);
  }, []);

  function onRotationChange(value) {
    rotationAngleJS.value = value;
  }
  function onScaleChange(value) {
    scaleJS.value = value;
  }
  function onProgressChange(value) {
    progressJS.value = value;
    debugPlaneMesh2Ref.current.material.uniforms.uProgress.value = value;
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

        <p>progress</p>
        <input
          type="range"
          min="0.0"
          max="1.0"
          step="0.01"
          className="slider"
          onChange={(e) => onProgressChange(e.target.value)}
        ></input>
      </div>
      <canvas id="canvas" className="canvas" ref={canvasRef}></canvas>
    </div>
  );
}
