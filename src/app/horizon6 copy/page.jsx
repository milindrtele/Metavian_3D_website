"use client";

import StartingMessage from "../components/startingMessage/startingMessage";
import GetStarted from "../components/getStarted/getStarted";

import { useRef, useState, useEffect } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { TransformControls } from "three/addons/controls/TransformControls.js";
import TWEEN from "@tweenjs/tween.js";
import fboVertex from "../lib/shaders/fbo/fboVertex.glsl";
import fboFragment from "../lib/shaders/fbo/fboFragment_2.glsl";

import testVertex from "../lib/shaders/test/testVertex.glsl";
import testFragment from "../lib/shaders/test/testFragment.glsl";

import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { SSRPass } from "three/addons/postprocessing/SSRPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { TAARenderPass } from "three/addons/postprocessing/TAARenderPass.js";
import { BokehPass } from "three/addons/postprocessing/BokehPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";

import { RGBELoader } from "three/addons/loaders/RGBELoader.js";

import { RectAreaLightHelper } from "three/addons/helpers/RectAreaLightHelper.js";
import { RectAreaLightUniformsLib } from "three/addons/lights/RectAreaLightUniformsLib.js";

import Stats from "three/addons/libs/stats.module.js";

import styles from "./page.module.css";
import { mat2 } from "three/examples/jsm/nodes/Nodes";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CustomEase } from "gsap/CustomEase";

import PositionAlongPathState from "../lib/positionAlongPathTools/PositionAlongPathState.js";
import {
  handleScroll,
  updatePosition,
} from "../lib/positionAlongPathTools/PositionAlongPathMethods.js";
import { loadCurveFromJSON } from "../lib/curveTools/CurveMethods.js";

import {
  loadAssetsWithPromise,
  blenderCamera,
  mixer,
  capsule_model,
  capsule_anchor,
  cockpit_canopy,
  cubeCamera,
  projectModels,
  projectModelsAnchors,
} from "../lib/scripts/assetLoader_new.js";

import { setupGrid } from "../lib/scripts/setupGrid.js";

import { animateProductModels } from "../lib/scripts/animateProductModels.js";

import { NodeToyMaterial } from "@nodetoy/three-nodetoy";
// import { data } from "../lib/shaders/scan_lines/scan_lines_shader_data.js";

// import scanLinesVertex from "../lib/shaders/scan_lines/scan_lines_vertex.glsl";
// import scanLinesFragment from "../lib/shaders/scan_lines/scan_lines_fragment.glsl";

import { GUI } from "three/addons/libs/lil-gui.module.min.js";

export default function Horizon() {
  const blenderCameraAnimationFrames = 1500;
  const blenderCameraAnimationFrameRate = 24;
  const totalLengthOfAnimation =
    blenderCameraAnimationFrames / blenderCameraAnimationFrameRate;
  const [assetsLoadedSuccessfully, setAssetsLoadedSuccessfully] =
    useState(false);
  const [isStartingMessageVisible, setIsStartingMessageVisible] =
    useState(true);

  let positionAlongPathState = new PositionAlongPathState();
  let modelLoaded = false;
  let circlepath = null;
  let targetPath = null;
  const loader = new GLTFLoader();

  let stats = null;
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);
  const transformControlRef = useRef(null);

  let uniformsForGrid = null;

  const baseCubeRef = useRef(null);
  const instancedMeshRef = useRef(null);
  const instancedMesh2Ref = useRef(null);
  let timeUniform = { value: 0.0 };

  const taaRenderPassRef = useRef(null);

  let overallAnimationLevelJS = { value: 1.0 };
  let rotationAngleJS = { value: 0.0 };
  let scaleJS = { value: 2.75 };
  let scaleRingJS = { value: 100.0 };
  const progressJSRef = useRef({ value: 0.0 });

  const matcapTextureRef = useRef(null);

  // fbo scene
  let fboRef = useRef(null);
  let fboCamera = null;
  let fboScene = null;
  let fboMaterial = null;
  let fboGeo = null;
  let fboMesh = null;

  const fashionIXSceneRef = useRef(null);
  const fashionIXanchorRef = useRef(null);

  const productAssetsRef = useRef([]);
  const productAssetAnchorRef = useRef([]);

  const logoAnimationCompletedRef = useRef(false);

  const blenderCameraRef = useRef(null);
  const clipRef = useRef(null);
  const mixerRef = useRef(null);

  const scan_lines_meshRef = useRef(null);
  const capsule_anchorRef = useRef(null);

  const targetObject = new THREE.Object3D();

  const [isGetStartedVisible, setIsGetStartedVisible] = useState(false);

  const [initialSequenceCompleted, setInitialSequenceCompleted] =
    useState(false);

  const animationTimelineRef = useRef(null);

  const [getStartedCompleted, setGetStartedCompleted] = useState(false);

  const activeCameraRef = useRef(null);
  const startSequenceCompleteRef = useRef(false);

  gsap.registerPlugin(ScrollTrigger);
  gsap.registerPlugin(CustomEase);

  function setupFBO() {
    fboRef.current = new THREE.WebGLRenderTarget(1000, 866);
    fboCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
    fboCamera.position.z = 1;
    fboScene = new THREE.Scene();
    fboMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: timeUniform,
        uFBO: { value: null },
        uProgress: progressJSRef.current,
        rotationAngle: rotationAngleJS,
        vScale: scaleJS,
        mt1: { value: 7 / totalLengthOfAnimation },
        mt2: { value: 18 / totalLengthOfAnimation },
        mt3: { value: 30 / totalLengthOfAnimation },
        mt4: { value: 40 / totalLengthOfAnimation },
        mt5: { value: 50 / totalLengthOfAnimation },
        mt6: { value: 62 / totalLengthOfAnimation },
        step1: {
          value: new THREE.TextureLoader().load("/images/metavian-logo.png"),
        },
        step3: {
          value: new THREE.TextureLoader().load(
            "/images/island_2/islands_02.jpg"
          ),
        },
        step4: {
          value: new THREE.TextureLoader().load("/images/island_2/01.jpg"),
        },
        step5: {
          value: new THREE.TextureLoader().load("/images/island_2/02.jpg"),
        },
        step6: {
          value: new THREE.TextureLoader().load("/images/island_2/03.jpg"),
        },
        step7: {
          value: new THREE.TextureLoader().load("/images/island_2/04.jpg"),
        },
        step8: {
          value: new THREE.TextureLoader().load("/images/island_2/05.jpg"),
        },
        step9: {
          value: new THREE.TextureLoader().load("/images/island_2/06.jpg"),
        },
        step10: {
          value: new THREE.TextureLoader().load("/images/island_2/06.jpg"),
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
    if (sceneRef.current == null) {
      stats = new Stats();
      document.body.appendChild(stats.dom);
      //Scene is container for objects, cameras, and lights
      sceneRef.current = new THREE.Scene();

      rendererRef.current = new THREE.WebGLRenderer({
        canvas: canvasRef.current,
        antialias: true,
      });

      //rendererRef.current.shadowMap.enabled = true;
      //rendererRef.current.shadowMap.type = THREE.VSMShadowMap;

      rendererRef.current.setSize(window.innerWidth, window.innerHeight);

      // Create a camera and set its position and orientation
      cameraRef.current = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
      );
      cameraRef.current.position.set(0, 130, -1);
      cameraRef.current.lookAt(0, 0, 0);
      // cameraRef.current.position.set(
      //   -0.7991004239308976,
      //   95.78004293545669,
      //   -93.1330439035733
      // );
      controlsRef.current = new OrbitControls(
        cameraRef.current,
        rendererRef.current.domElement
      );
      //controlsRef.current.enableZoom = false;
      //controlsRef.current.enablePan = false;
      controlsRef.current.enabled = false;
      transformControlRef.current = new TransformControls(
        cameraRef.current,
        rendererRef.current.domElement
      );
      transformControlRef.current.addEventListener(
        "dragging-changed",
        function (event) {
          controlsRef.current.enabled = !event.value;
        }
      );

      // Add the camera to the scene
      sceneRef.current.add(cameraRef.current);

      // circlepath = await loadCurveFromJSON(
      //   sceneRef.current,
      //   "/curve_paths/curve_from_ashutosh.json"
      // );

      // targetPath = await loadCurveFromJSON(
      //   sceneRef.current,
      //   "/curve_paths/target_curve_from_ashutosh.json"
      // );

      // targetObject.position.set(0, 0, 0);

      //sceneRef.current.add(circlepath.mesh);

      //cameraRef.current.position.copy(circlepath.curve.getPointAt(0));
      //cameraRef.current.lookAt(targetObject.position);

      // window.addEventListener("wheel", onMouseScroll, false);
      // window.addEventListener("touchmove", onMouseScroll, false);

      // function onMouseScroll(event) {
      //   handleScroll(event, positionAlongPathState);
      // }

      //sceneRef.current.fog = new THREE.Fog(0x99ddff, 500, 1000);

      // const dlight = new THREE.DirectionalLight(0xffffff, 1);

      // dlight.position.set(200, 1000, 50);
      // dlight.position.set(200, 1000, 50);
      // sceneRef.current.add(dlight);

      // const helper = new THREE.DirectionalLightHelper(dlight, 5);
      // sceneRef.current.add(helper);

      //dlight.castShadow = true;

      const spotLightParent = new THREE.Object3D();
      spotLightParent.position.set(0, 0, 0);
      sceneRef.current.add(spotLightParent);
      //spotlight1
      const spotlight1 = new THREE.SpotLight(0xffffff, 100000);
      spotlight1.position.set(100, 100, 100);
      spotlight1.penumbra = 0.5;
      spotlight1.distance = 500;
      spotlight1.angle = (Math.PI / 180) * 35;
      //spotlight2
      const spotlight2 = new THREE.SpotLight(0xffffff, 100000);
      spotlight2.position.set(-100, 100, 100);
      spotlight2.penumbra = 0.5;
      spotlight2.distance = 500;
      spotlight2.angle = (Math.PI / 180) * 35;
      //spotlight3
      const spotlight3 = new THREE.SpotLight(0xffffff, 100000);
      spotlight3.position.set(0, 100, -100);
      spotlight3.penumbra = 0.5;
      spotlight3.distance = 500;
      spotlight3.angle = (Math.PI / 180) * 35;

      spotLightParent.add(spotlight1);
      spotLightParent.add(spotlight2);
      spotLightParent.add(spotlight3);

      // spotlight1.castShadow = true;
      // spotlight1.shadow.bias = -0.01;
      // spotlight2.castShadow = true;
      // spotlight2.shadow.bias = -0.01;
      // spotlight3.castShadow = true;
      // spotlight3.shadow.bias = -0.01;

      // spotlight1.shadow.mapSize.x = 1024;
      // spotlight1.shadow.mapSize.y = 1024;

      // spotLight.shadow.camera.left = -5000;
      // spotLight.shadow.camera.right = 5000;
      // spotLight.shadow.camera.top = 5000;
      // spotLight.shadow.camera.bottom = -5000;
      // spotLight.shadow.camera.far = 2000;

      // spotLight.shadow.bias = -0.01;

      // spotLight.shadow.camera.updateProjectionMatrix();

      // const spotLightHelper = new THREE.SpotLightHelper(spotLight);
      // sceneRef.current.add(spotLightHelper);

      // const hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.01);
      // hemiLight.position.set(0, 0.116, 0);
      // sceneRef.current.add(hemiLight);

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

      // const shaderMaterial = new THREE.ShaderMaterial({
      //   uniforms: {
      //     time: { value: 1.0 },
      //     resolution: { value: new THREE.Vector2() },
      //   },

      //   vertexShader: cubeVertex,
      //   fragmentShader: cubeFragment,
      // });

      // const scanLineShaderMaterial = new THREE.ShaderMaterial({
      //   uniforms: [
      //     {
      //       name: "Color",
      //       type: "vec4",
      //       value: {
      //         x: 0.011764705882352941,
      //         y: 1,
      //         z: 1,
      //         w: 1,
      //       },
      //     },
      //     {
      //       name: "Range",
      //       type: "float",
      //       value: 0.82,
      //     },
      //     {
      //       name: "_time",
      //       type: "float",
      //       value: 0,
      //     },
      //     {
      //       name: "Speed",
      //       type: "float",
      //       value: -2,
      //     },
      //   ],

      //   vertexShader: scanLinesVertex,
      //   fragmentShader: scanLinesFragment,
      //   cullMode: "off",
      //   lightModel: "standard",
      //   renderType: "transparent",
      // });

      // add the debug plane
      // console.log(fboRef.current.texture);
      // const debugPlaneGeo = new THREE.PlaneGeometry(20, 17.7);
      // const debugPlaneMat = new THREE.MeshBasicMaterial({
      //   //map: new THREE.TextureLoader().load("images/ring.jpg"),
      //   map: fboRef.current.texture,
      //   side: THREE.DoubleSide,
      // });

      // // const scan_lines = new NodeToyMaterial({
      // //   data,
      // //   //url: "https://draft.nodetoy.co/teCGtR1LIJGk4CO1",
      // // });
      // // scan_lines.side = THREE.DoubleSide;
      // const debugPlaneMesh = new THREE.Mesh(debugPlaneGeo, debugPlaneMat);
      // debugPlaneMesh.position.set(0, 20, 0);
      // sceneRef.current.add(debugPlaneMesh);

      // console.log(scan_lines);

      // const debugPlane2Geo = new THREE.PlaneGeometry(20, 20);
      // const debugPlane2Mat = new THREE.ShaderMaterial({
      //   uniforms: {
      //     time: timeUniform,
      //     uFBO: null,
      //     uProgress: progressJSRef.current,
      //     step1: {
      //       value: new THREE.TextureLoader().load("/images/metavian-logo.png"),
      //     },
      //     step3: {
      //       value: new THREE.TextureLoader().load(
      //         "/images/island_2/islands_02.jpg"
      //       ),
      //     },
      //     step4: {
      //       value: new THREE.TextureLoader().load("/images/island_2/01.jpg"),
      //     },
      //     step5: {
      //       value: new THREE.TextureLoader().load("/images/island_2/02.jpg"),
      //     },
      //     step6: {
      //       value: new THREE.TextureLoader().load("/images/island_2/03.jpg"),
      //     },
      //     step7: {
      //       value: new THREE.TextureLoader().load("/images/island_2/04.jpg"),
      //     },
      //     step8: {
      //       value: new THREE.TextureLoader().load("/images/island_2/05.jpg"),
      //     },
      //     step9: {
      //       value: new THREE.TextureLoader().load("/images/island_2/06.jpg"),
      //     },
      //     step10: {
      //       value: new THREE.TextureLoader().load("/images/island_2/06.jpg"),
      //     },
      //   },
      //   vertexShader: fboVertex,
      //   fragmentShader: fboFragment,
      // });
      // debugPlane2Mat.side = THREE.DoubleSide;
      // const debugPlane2Mesh = new THREE.Mesh(debugPlane2Geo, debugPlane2Mat);
      // debugPlane2Mesh.position.set(30, 20, 0);
      // sceneRef.current.add(debugPlane2Mesh);

      //

      loadAssetsWithPromise(
        loader,
        clipRef.current,
        productAssetsRef.current,
        productAssetAnchorRef.current,
        sceneRef.current
      )
        .then(() => {
          console.log("All assets loaded successfully!");
          console.log(projectModels[0]);
          console.log(projectModelsAnchors);
          blenderCameraRef.current = blenderCamera;
          mixerRef.current = mixer;
          scan_lines_meshRef.current = capsule_model;
          capsule_anchorRef.current = capsule_anchor;
          sceneRef.current.add(capsule_model);
          transformControlRef.current.attach(capsule_anchor);
          sceneRef.current.add(transformControlRef.current);
          setAssetsLoadedSuccessfully(true);
        })
        .catch((error) => {
          console.error("An error occurred while loading assets:", error);
        });

      uniformsForGrid = {
        bottom_level: { value: 0.1 },
        crest: { value: 100.0 },
        amplitude: { value: 100.0 },
        start_level: { value: 1.0 },
        frequency: { value: 5.0 },
        overallAnimationLevel: overallAnimationLevelJS,
        // rotationAngle: rotationAngleJS,
        // vScale: scaleJS,
        rotationAngle: { value: 0 },
        vScale: { value: 1.0 },
        vScaleRing: scaleRingJS,
        time: timeUniform,
        uFBO: {
          value: fboRef.current.texture,
        },
      };

      setupGrid(loader, uniformsForGrid, sceneRef.current);

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

      //bokeh pass
      const bokehPass = new BokehPass(sceneRef.current, cameraRef.current, {
        focus: 50.0,
        aperture: 0.2,
        maxblur: 0.01,
      });

      //composer.addPass(ssrPass);
      //composer.addPass(bloomPass);
      composer.addPass(taaRenderPassRef.current);
      //composer.addPass(bokehPass);

      composer.addPass(new OutputPass());

      const effectController = {
        focus: 500.0,
        aperture: 5,
        maxblur: 0.01,
      };

      const matChanger = function () {
        bokehPass.uniforms["focus"].value = effectController.focus;
        bokehPass.uniforms["aperture"].value =
          effectController.aperture * 0.00001;
        bokehPass.uniforms["maxblur"].value = effectController.maxblur;
      };

      const gui = new GUI();
      gui.add(effectController, "focus", 0.1, 100.0, 0.1).onChange(matChanger);
      gui.add(effectController, "aperture", 0, 10, 0.1).onChange(matChanger);
      gui
        .add(effectController, "maxblur", 0.0, 0.01, 0.001)
        .onChange(matChanger);
      gui.close();

      matChanger();

      function lookAtCamera() {
        // if (fashionIXanchorRef.current != null)
        //   fashionIXanchorRef.current.lookAt(cameraRef.current.position);
      }

      function getAssetPositions() {
        if (productAssetAnchorRef.current.length >= 3) {
          let last = productAssetAnchorRef.current.length - 1;
          //console.log(productAssetAnchorRef.current[last].position);
        }
      }

      function onWindowResize() {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
        cameraRef.current.aspect =
          canvasRef.current.width / canvasRef.current.height;

        composer.setSize(canvasRef.current.width, canvasRef.current.height);
        rendererRef.current.setSize(
          canvasRef.current.width,
          canvasRef.current.height
        );

        cameraRef.current.updateProjectionMatrix();
      }

      // Animate the scene
      let time = 0;
      function animate() {
        requestAnimationFrame(animate);

        //console.log(progressJSRef.current.value);

        // if (capsule_anchor) {
        //   console.log(capsule_anchor.position);
        // }

        if (cubeCamera != null)
          cubeCamera.update(rendererRef.current, sceneRef.current);

        stats.update();

        //getAssetPositions();

        // if (modelLoaded && circlepath != null) {
        //   updatePosition(circlepath, cameraRef.current, positionAlongPathState);
        //   //updatePosition(targetPath, targetObject, positionAlongPathState);
        // }

        time += 0.01;
        //shaderMaterial.uniforms.time.value = time;
        timeUniform.value = time;

        spotLightParent.rotation.y += 0.01;
        //controlsRef.current.update();

        TWEEN.update();

        rendererRef.current.setRenderTarget(fboRef.current);
        rendererRef.current.render(fboScene, fboCamera);

        //console.log(fbo);

        rendererRef.current.setRenderTarget(null);

        if (uniformsForGrid != null) {
          uniformsForGrid.uFBO.value = fboRef.current.texture;
        }
        // if (startSequenceCompleteRef.current) {
        //   rendererRef.current.render(
        //     sceneRef.current,
        //     blenderCameraRef.current
        //   );
        // } else {
        //   rendererRef.current.render(sceneRef.current, cameraRef.current);
        // }
        rendererRef.current.render(sceneRef.current, cameraRef.current);
        //composer.render();

        NodeToyMaterial.tick();
      }
      animate();
      window.addEventListener("resize", onWindowResize);
    }
  }

  useEffect(() => {
    let isMounted = true;

    setupFBO();
    setupScene();
  }, []);

  // function showHideAssets() {
  //   const last = productAssetsRef.current.length - 1;
  //   if (
  //     productAssetAnchorRef.current.length > 0 &&
  //     progressJSRef.current.value >= 0.7 &&
  //     progressJSRef.current.value <= 0.8
  //   ) {
  //     console.log("hide show running : 1");
  //     productAssetsRef.current.forEach((object) => {
  //       sceneRef.current.remove(object);
  //     });
  //     sceneRef.current.add(productAssetsRef.current[0]);
  //   } else if (
  //     productAssetAnchorRef.current.length > 0 &&
  //     progressJSRef.current.value >= 0.8 &&
  //     progressJSRef.current.value <= 0.9
  //   ) {
  //     console.log("hide show running : 2");
  //     productAssetsRef.current.forEach((object) => {
  //       sceneRef.current.remove(object);
  //     });
  //     sceneRef.current.add(productAssetsRef.current[1]);
  //   } else if (
  //     productAssetAnchorRef.current.length > 0 &&
  //     progressJSRef.current.value >= 0.9
  //   ) {
  //     console.log(productAssetsRef.current);
  //     productAssetsRef.current.forEach((object) => {
  //       sceneRef.current.remove(object);
  //     });
  //     sceneRef.current.add(productAssetsRef.current[2]);
  //   } else {
  //     productAssetsRef.current.forEach((object) => {
  //       sceneRef.current.remove(object);
  //     });
  //   }
  // }

  // useEffect(() => {
  //   showHideAssets();
  //   // console.log(progressJSRef.current.value);
  //   // if (progressJSRef.current.value >= 0.6) {
  //   //   if (productAssetAnchorRef.current.length >= 3) {
  //   //     productAssectsRef.current.forEach((object) => {
  //   //       console.log(object);
  //   //       object.visible = true;
  //   //       sceneRef.current.add(object);
  //   //     });
  //   //   } else {
  //   //     productAssectsRef.current.forEach((object) => {
  //   //       console.log(object);
  //   //       object.visible = false;
  //   //       sceneRef.current.remove(object);
  //   //     });
  //   //   }
  //   // }
  // }, [progressJSRef.current.value]);

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

  useEffect(() => {
    // ScrollTrigger.create({
    //   trigger: ".container",
    //   start: "top",
    //   end: "20000px",
    //   pin: true,
    //   //markers: true,
    //   onUpdate: (self) => {
    //     progressJSRef.current.value = self.progress;
    //     //showHideAssets();
    //   },
    // });
  }, []);

  useEffect(() => {
    if (!isStartingMessageVisible) {
      const clock = new THREE.Clock();
      let previousTime = 0;
      var speed = 0.1;
      let delta = 0;
      let previousProgress = 0.0;
      let Currentprogress = 0.0;

      const cameraEndPosition = {
        x: 0,
        y: 4,
        z: -100,
      };
      const cameraTargetPosition = {
        x: 53.8746,
        y: 0.041356,
        z: -30.8687,
      };
      const capsuleEndPosition = {
        x: 26.844, // blender_x
        y: -5, // blender_z
        z: -83.10922187556825, // -1 * blender_y
      };
      const capsuleEndRotation = {
        x: (0 * Math.PI) / 180, // blender_x
        y: (0 * Math.PI) / 180, // blender_z
        z: (0 * Math.PI) / 180, // -1 * blender_y
      };

      const logoAnimationTimeline = gsap.timeline({});
      animationTimelineRef.current = gsap.timeline({});
      // const animateLogo = gsap.timeline({});
      // const animateCamera = gsap.timeline({});
      // const animateCapsule = gsap.timeline({});
      const animateLogo = logoAnimationTimeline.to(progressJSRef.current, {
        delay: 2,
        value: 0.2,
        duration: 20,
      });
      const animateCamera = animationTimelineRef.current.to(
        cameraRef.current.position,
        {
          ...cameraEndPosition,
          // x: 21.8609, // blender_x
          // y: 0.041356, // blender_z
          // z: -67.348, // -1 * blender_y
          delay: 5,
          duration: 5,
          ease: CustomEase.create(
            "custom",
            "M0,0 C0.106,0 0.195,0.008 0.288,0.063 0.513,0.198 0.589,0.618 0.714,0.829 0.797,0.97 0.893,1 1,1 "
          ),
          onStart: () => {
            let target = { x: 0, y: 0, z: 0 };
            gsap.to(target, {
              ...cameraTargetPosition,
              duration: 5,
              ease: CustomEase.create(
                "custom",
                "M0,0 C0.106,0 0.195,0.008 0.288,0.063 0.513,0.198 0.589,0.618 0.714,0.829 0.797,0.97 0.893,1 1,1 "
              ),
              onUpdate: () => {
                cameraRef.current.lookAt(target.x, target.y, target.z);
              },
            });
            gsap.to(cameraRef.current, {
              fov: 50,
              duration: 5,
              onUpdate: () => {
                cameraRef.current.updateProjectionMatrix();
              },
            });
          },
          onComplete: () => {},
        }
      );
      const animateCapsule = animationTimelineRef.current.to(
        capsule_anchor.position,
        {
          ...capsuleEndPosition,
          // delay: 10,
          duration: 4,
          ease: CustomEase.create(
            "custom",
            "M0,0 C0.106,0 0.195,0.008 0.288,0.063 0.513,0.198 0.589,0.618 0.714,0.829 0.797,0.97 0.893,1 1,1 "
          ),
          onStart: () => {
            // let target = { x: 0, y: 0, z: 0 };
            // gsap.to(target, {
            //   x: cameraRef.current.position.x,
            //   y: cameraRef.current.position.y,
            //   z: cameraRef.current.position.z,
            //   duration: 5,
            //   ease: CustomEase.create(
            //     "custom",
            //     "M0,0 C0.106,0 0.195,0.008 0.288,0.063 0.513,0.198 0.589,0.618 0.714,0.829 0.797,0.97 0.893,1 1,1 "
            //   ),
            //   onUpdate: () => {
            //     capsule_anchor.lookAt(target.x, target.y, target.z);
            //   },
            // });
            let targetRotation = { x: 0, y: (180 * Math.PI) / 180, z: 0 };
            gsap.to(targetRotation, {
              ...capsuleEndRotation,
              duration: 4,
              ease: CustomEase.create(
                "custom",
                "M0,0 C0.106,0 0.195,0.008 0.288,0.063 0.513,0.198 0.589,0.618 0.714,0.829 0.797,0.97 0.893,1 1,1 "
              ),
              onUpdate: () => {
                capsule_anchor.rotation.y = targetRotation.y;
              },
            });
          },
          onComplete: () => {
            setIsGetStartedVisible(true);
            setInitialSequenceCompleted(true);
          },
        }
      );
    }
  }, [isStartingMessageVisible, assetsLoadedSuccessfully]);

  useEffect(() => {
    if (initialSequenceCompleted && !isGetStartedVisible) {
    }
  }, [initialSequenceCompleted, isGetStartedVisible]);

  useEffect(() => {
    if (getStartedCompleted) {
      const cameraLeftPanEndPos = { x: 8.54455, y: 4, z: -105.943 };
      const cameraForwardPanEndPos = {
        x: 26.844, // blender_x
        y: 4, // blender_z
        z: -83.10922187556825, // -1 * blender_y
      };

      let cameraTimeline = gsap.timeline();
      const cameraLeftPan = cameraTimeline.to(cameraRef.current.position, {
        ...cameraLeftPanEndPos,
        duration: 1,
        ease: CustomEase.create(
          "custom",
          "M0,0 C0.106,0 0.195,0.008 0.288,0.063 0.513,0.198 0.589,0.618 0.714,0.829 0.797,0.97 0.893,1 1,1 "
        ),
      });
      // const cockpit_canopyDrop = cameraTimeline.to(cockpit_canopy.scale, {
      //   x: 1,
      //   y: 0,
      //   z: 1,
      //   duration: 1,
      //   ease: CustomEase.create(
      //     "custom",
      //     "M0,0 C0.106,0 0.195,0.008 0.288,0.063 0.513,0.198 0.589,0.618 0.714,0.829 0.797,0.97 0.893,1 1,1 "
      //   ),
      // });
      const cameraForwardPan = cameraTimeline.to(cameraRef.current.position, {
        ...cameraForwardPanEndPos,
        duration: 1,
        delay: 1,
        ease: CustomEase.create(
          "custom",
          "M0,0 C0.106,0 0.195,0.008 0.288,0.063 0.513,0.198 0.589,0.618 0.714,0.829 0.797,0.97 0.893,1 1,1 "
        ),
        onStart: () => {
          // const cameraTargetPosition = {
          //   x: 53.8746,
          //   y: 0.041356,
          //   z: -30.8687,
          // };
          // let target = { x: 0, y: 0, z: 0 };
          // gsap.to(target, {
          //   ...cameraTargetPosition,
          //   duration: 5,
          //   ease: CustomEase.create(
          //     "custom",
          //     "M0,0 C0.106,0 0.195,0.008 0.288,0.063 0.513,0.198 0.589,0.618 0.714,0.829 0.797,0.97 0.893,1 1,1 "
          //   ),
          //   onUpdate: () => {
          //     cameraRef.current.lookAt(target.x, target.y, target.z);
          //   },
          //   onComplete: () => {
          //     controlsRef.current.enabled = true;
          //   },
          // });
        },
        onComplete: () => {
          controlsRef.current.enabled = true;
          startSequenceCompleteRef.current = true;

          addScrollTrigger();
        },
      });
    }
  }, [getStartedCompleted]);

  useEffect(() => {
    if (startSequenceCompleteRef.current) {
    }
  }, [startSequenceCompleteRef.current]);

  // useEffect(() => {
  //   ScrollTrigger.create({
  //     trigger: ".container",
  //     start: "top",
  //     end: "500px",
  //     pin: true,
  //     markers: true,
  //     onUpdate: (self) => {
  //       console.log("scroll progress : " + self.progress);

  //       progressJSRef.current.value = Math.max(
  //         0.2,
  //         Math.min(self.progress + 0.2, 1.0)
  //       ); //self.progress + 0.2;
  //       //showHideAssets();
  //       onMouseScroll(1 - self.progress);

  //       //copy the position and rotation of the imported camera from blender .glb///////////////////////////////

  //       if (blenderCameraRef.current != null) {
  //         cameraRef.current.position.copy(blenderCameraRef.current.position);
  //         cameraRef.current.rotation.copy(blenderCameraRef.current.rotation);
  //         cameraRef.current.quaternion.copy(
  //           blenderCameraRef.current.quaternion
  //         );
  //         console.log(blenderCameraRef.current.position);
  //         cameraRef.current.updateMatrix();
  //       }
  //     },
  //   });
  // }, []);

  function addScrollTrigger() {
    console.log("adding scroll trigger");
    //setGetStartedCompleted(true);
    //controlsRef.current.enabled = false; // desable the orbit controls
    logoAnimationCompletedRef.current = true;
    ScrollTrigger.create({
      trigger: "#container",
      start: "top",
      end: "25000",
      pin: true,
      markers: true,
      onUpdate: (self) => {
        const min = 0.2;
        const max = 1.0;

        progressJSRef.current.value = self.progress * (max - min) + min;

        // progressJSRef.current.value = Math.max(
        //   0.2,
        //   Math.min(self.progress + 0.2, 1.0)
        // ); //self.progress + 0.2;
        // showHideAssets();

        // let progressForProductAnimation = Math.max(
        //   0.1,
        //   (progressJSRef.current.value - 0.2) * (max - 0.2)
        // );

        // let progressForProductAnimation = Math.max(0.0, self.progress - 0.15);
        let progressForProductAnimation = Math.max(
          0.0,
          Math.min(1.0, (self.progress - 0.15) / (1 - 0.15))
        );

        console.log(
          "scroll : " +
            self.progress +
            " , " +
            "product : " +
            progressForProductAnimation +
            " , " +
            "shader : " +
            progressJSRef.current.value
        );

        onMouseScroll(progressForProductAnimation);

        //copy the position and rotation of the imported camera from blender .glb///////////////////////////////

        // if (blenderCameraRef.current != null) {
        //   cameraRef.current.position.copy(blenderCameraRef.current.position);
        //   cameraRef.current.position.y =
        //     blenderCameraRef.current.position.y - 3;
        //   cameraRef.current.rotation.copy(blenderCameraRef.current.rotation);
        //   cameraRef.current.quaternion.copy(
        //     blenderCameraRef.current.quaternion
        //   );
        //   //console.log(blenderCameraRef.current.position);
        //   cameraRef.current.updateMatrix();
        // }
      },
    });
  }

  function checkScrollDirectionIsUp(progress) {
    if (previousProgress < progress) {
      previousProgress = progress;
      return false;
    } else {
      previousProgress = progress;
      return true;
    }
  }

  const clock = new THREE.Clock();
  let previousTime = 0;
  var speed = 0.1;
  let delta = 0;
  let previousProgress = 0.0;
  let Currentprogress = 0.0;
  const totalAnimationSeconds =
    blenderCameraAnimationFrames / blenderCameraAnimationFrameRate;

  function onMouseScroll(progress) {
    if (mixerRef.current !== null) {
      const elapsedTime = progress * totalAnimationSeconds;

      animateProductModels(
        sceneRef.current,
        projectModels,
        projectModelsAnchors,
        elapsedTime
      );

      mixerRef.current.setTime(elapsedTime);

      // if (checkScrollDirectionIsUp(progress)) {
      //   mixerRef.current.setTime(elapsedTime);
      // } else {
      //   mixerRef.current.setTime(elapsedTime);
      // }
    }
  }

  function onRotationChange(value) {
    rotationAngleJS.value = value;
  }
  function onScaleChange(value) {
    scaleJS.value = value;
  }
  // function onProgressChange(value) {
  //   progressJSRef.current.value = value;
  //   showHideAssets();
  // }
  const startingMessageContinue = () => {
    setIsStartingMessageVisible(false);
  };

  const GetStartedContinue = () => {
    setIsGetStartedVisible(false);
    setGetStartedCompleted(true);
  };

  return (
    <div id="container">
      <div className={styles.slidecontainer}>
        <div id="rotation_slider" className={styles.rotation_slider}>
          <p>rotation</p>
          <input
            type="range"
            min="0"
            max="360"
            step="1"
            onChange={(e) => onRotationChange(e.target.value)}
          ></input>
        </div>

        <div id="scale_slider" className={styles.scale_slider}>
          <p>scale</p>
          <input
            type="range"
            min="1"
            max="10"
            step="0.01"
            className="slider"
            id="myRange"
            onChange={(e) => onScaleChange(e.target.value)}
          ></input>
        </div>

        {/* <div id="prgress_slider" className={styles.prgress_slider}>
          <p>progress</p>
          <input
            type="range"
            min="0.0"
            max="1.0"
            step="0.001"
            className="slider"
            onChange={(e) => onProgressChange(e.target.value)}
          ></input>
        </div> */}
      </div>
      <canvas id="canvas" className="canvas" ref={canvasRef}></canvas>
      {isStartingMessageVisible && (
        <StartingMessage continue={startingMessageContinue} />
      )}
      {isGetStartedVisible && <GetStarted continue={GetStartedContinue} />}
      {/* {isStartingMessageVisible && <GetStarted />} */}
    </div>
  );
}
