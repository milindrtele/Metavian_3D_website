"use client";

import Beepie from "../components/beepie/beepie.jsx";
import StartingMessage from "../components/startingMessage/startingMessage.jsx";
import GetStarted from "../components/getStarted/getStarted.jsx";
import HamburgerMenu from "../components/hamburgerMenu/hamburgerMenu.jsx";
import Model_viewer from "../components/model_viewer/model_viewer.jsx";

import { useRef, useState, useEffect } from "react";
import * as THREE from "three";
import {
  CSS3DRenderer,
  CSS3DObject,
} from "three/addons/renderers/CSS3DRenderer.js";
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
import { ScrollToPlugin } from "gsap/dist/ScrollToPlugin";
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
  contact_model_Camera,
  mixer,
  contact_models_animation_mixer,
  capsule_model,
  capsule_anchor,
  capsule_body,
  projection_screen_anchor,
  projection_object,
  legs_parent,
  cockpit_canopy,
  cubeCamera,
  projectModels,
  projectModelsAnchors,
  animationMixers,
  media_model_array,
  social_media_models_scene,
  spot_lights_array,
  highlighter_objects_array,
  letters_anchor,
  icon_animations,
  teamScene,
  printerScene,
} from "../lib/scripts/assetLoader_02.js";

import animateSpotLights from "../lib/scripts/animateSpotLights.js";

import {
  setUpProjectionScreen,
  projected_screen,
  iframe,
  hideiFrame,
  showiFrame,
} from "../lib/scripts/projection_screen.js";

import { RaycasterHandler } from "../lib/scripts/raycaster.js";

import { animateCapsuleRotation } from "../lib/scripts/animateCapsuleRotation.js";

import { tweenCameraToNewPositionAndRotation } from "../lib/scripts/tweenCameraToPosition.js";

import { setupGrid } from "../lib/scripts/setupGrid.js";

import { animateProductModels } from "../lib/scripts/animateProductModels.js";

import aniSequenceAfterGetStarted from "../lib/scripts/aniSequenceAfterSetStarted.js";
import aniSwquenceBeforeGetStarted from "../lib/scripts/aniSequenceBeforeGetStarted.js";

import { NodeToyMaterial } from "@nodetoy/three-nodetoy";
// import { data } from "../lib/shaders/scan_lines/scan_lines_shader_data.js";

// import scanLinesVertex from "../lib/shaders/scan_lines/scan_lines_vertex.glsl";
// import scanLinesFragment from "../lib/shaders/scan_lines/scan_lines_fragment.glsl";

import { GUI } from "three/addons/libs/lil-gui.module.min.js";

export default function Horizon() {
  const currentUserPositionRef = useRef(null);
  const productCameraTravelScrollTriggerRef = useRef(null);
  const contactsSceneCameraTravelScrollTriggerRef = useRef(null);

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
  const cssSceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const css3dRendererRef = useRef(null);
  const controlsRef = useRef(null);
  const transformControlRef = useRef(null);
  const animationIdRef = useRef(null);
  const [showChild, setShowChild] = useState(false);

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
  const contact_model_CameraRef = useRef(null);
  const clipRef = useRef(null);
  const mixerRef = useRef(null);
  const mixerArrayRef = useRef(null);
  const contact_models_animation_mixerRef = useRef(null);

  const scan_lines_meshRef = useRef(null);
  const capsule_anchorRef = useRef(null);

  const targetObject = new THREE.Object3D();

  const [isGetStartedVisible, setIsGetStartedVisible] = useState(false);

  const [initialSequenceCompleted, setInitialSequenceCompleted] =
    useState(false);

  const animationTimelineRef = useRef(null);

  const [getStartedCompleted, setGetStartedCompleted] = useState(false);

  const [isHamburgerMenuVisible, setIsHamburgerMenuVisible] = useState(false);

  const activeCameraRef = useRef(null);
  const startSequenceCompleteRef = useRef(false);

  const raycasterHandlerRef = useRef(null);

  const currentCameraTargetRef = useRef(null);

  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
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
        mt1: { value: 8 / totalLengthOfAnimation }, //7
        mt2: { value: 16 / totalLengthOfAnimation }, //18
        mt3: { value: 25 / totalLengthOfAnimation }, //30
        mt4: { value: 31 / totalLengthOfAnimation }, //40
        mt5: { value: 39 / totalLengthOfAnimation }, //50
        mt6: { value: 48 / totalLengthOfAnimation }, //60
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
      // stats = new Stats();
      // document.body.appendChild(stats.dom);
      //Scene is container for objects, cameras, and lights
      sceneRef.current = new THREE.Scene();

      cssSceneRef.current = new THREE.Scene();

      rendererRef.current = new THREE.WebGLRenderer({
        canvas: canvasRef.current,
        antialias: true,
      });

      // rendererRef.current = new CSS3DRenderer({
      //   canvas: canvasRef.current,
      //   antialias: true,
      // });

      //rendererRef.current.shadowMap.enabled = true;
      //rendererRef.current.shadowMap.type = THREE.VSMShadowMap;

      rendererRef.current.setSize(window.innerWidth, window.innerHeight);

      // CSS3D Renderer
      css3dRendererRef.current = new CSS3DRenderer();
      css3dRendererRef.current.setSize(window.innerWidth, window.innerHeight);
      css3dRendererRef.current.domElement.style.position = "absolute";
      css3dRendererRef.current.domElement.style.top = 0;
      css3dRendererRef.current.domElement.style.pointerEvents = "none";
      css3dRendererRef.current.domElement.style.position = "fixed";
      document.body.appendChild(css3dRendererRef.current.domElement);

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

      // Callback function to handle intersects
      function handleIntersects(intersects) {
        if (
          currentUserPositionRef.current == "Menu Item 2" &&
          intersects.length > 0
        ) {
          console.log("Intersected objects:", intersects);
          if (
            intersects[0].object.parent &&
            intersects[0].object.parent.parent &&
            intersects[0].object.parent.parent.name == "legs_parent" &&
            projection_object
          ) {
            animateCapsuleRotation(
              intersects[0].object,
              capsule_body,
              projection_object,
              projected_screen,
              iframe
            );
          }
        } else {
          //console.log(intersects[0].object.name);
        }
      }

      const bottomPos = -5;
      const topPos = 7;
      const letters_top_position = 2;

      function highlighterClickEffect(intersects) {
        if (intersects.length > 0) {
          if (intersects[0].object.name == "highlighter_address") {
            let position = letters_anchor.children[0].position;
            console.log(icon_animations);
            icon_animations[0].vars.stagger.repeat = 0;
            icon_animations[0].pause();
            gsap.to(position, {
              duration: 2.5,
              ease: "elastic.out(1, 0.3)",
              y: letters_top_position, // Toggle to opposite value
              onUpdate: () => {
                letters_anchor.children[0].position.set(...position);
                letters_anchor.children[0].position.set(...position);
              },
            });
          } else if (intersects[0].object.name == "highlighter_email") {
            let position = letters_anchor.children[1].position;
            icon_animations[1].pause();
            //icon_animations[1].stagger.repeat = 0;
            gsap.to(position, {
              duration: 2.5,
              ease: "elastic.out(1, 0.3)",
              y: letters_top_position, // Toggle to opposite value
              onUpdate: () => {
                letters_anchor.children[1].position.set(...position);
                letters_anchor.children[1].position.set(...position);
              },
            });
          } else if (intersects[0].object.name == "highlighter_phone") {
            let position = letters_anchor.children[2].position;
            //icon_animations[2].stagger.repeat = 0;
            icon_animations[2].pause();

            gsap.to(position, {
              duration: 2.5,
              ease: "elastic.out(1, 0.3)",
              y: letters_top_position, // Toggle to opposite value
              onUpdate: () => {
                letters_anchor.children[2].position.set(...position);
                letters_anchor.children[2].position.set(...position);
              },
            });
          }
        }
      }

      function highlighterHoverEffect(intersects) {
        if (intersects.length > 0) {
          if (intersects[0].object.name == "highlighter_address") {
            let position = highlighter_objects_array[1].position;

            gsap.to(position, {
              duration: 2.5,
              ease: "elastic.out(1, 0.3)",
              y: topPos, // Toggle to opposite value
              onUpdate: () => {
                highlighter_objects_array[1].position.set(...position);
                highlighter_objects_array[2].position.set(...position);
              },
            });
          } else if (intersects[0].object.name == "highlighter_email") {
            // Set initial position
            let yValue = topPos;

            // highlighter_objects_array[4].position.y = yValue;
            // highlighter_objects_array[5].position.y = yValue;

            let position = highlighter_objects_array[4].position;

            gsap.to(position, {
              duration: 2.5,
              ease: "elastic.out(1, 0.3)",
              y: topPos, // Toggle to opposite value
              onUpdate: () => {
                highlighter_objects_array[4].position.set(...position);
                highlighter_objects_array[5].position.set(...position);
              },
            });
          } else if (intersects[0].object.name == "highlighter_phone") {
            // Set initial position
            let yValue = topPos;

            // highlighter_objects_array[7].position.y = yValue;
            // highlighter_objects_array[8].position.y = yValue;

            let position = highlighter_objects_array[7].position;

            gsap.to(position, {
              duration: 2.5,
              ease: "elastic.out(1, 0.3)",
              y: topPos, // Toggle to opposite value
              onUpdate: () => {
                highlighter_objects_array[7].position.set(...position);
                highlighter_objects_array[8].position.set(...position);
              },
            });
          } else {
            if (
              highlighter_objects_array[1].position.y >= bottomPos ||
              highlighter_objects_array[4].position.y >= bottomPos ||
              highlighter_objects_array[7].position.y >= bottomPos
            ) {
              let position = highlighter_objects_array[1].position;
              gsap.to(position, {
                duration: 2.5,
                ease: "elastic.out(1, 0.3)",
                y: bottomPos, // Toggle to opposite value
                onUpdate: () => {
                  highlighter_objects_array[1].position.y = position.y;
                  highlighter_objects_array[2].position.y = position.y;
                  highlighter_objects_array[4].position.y = position.y;
                  highlighter_objects_array[5].position.y = position.y;
                  highlighter_objects_array[7].position.y = position.y;
                  highlighter_objects_array[8].position.y = position.y;
                },
              });
            }
          }
        }
      }

      // Setup raycaster with the callback
      // Instantiate the raycaster handler
      raycasterHandlerRef.current = new RaycasterHandler(
        sceneRef.current,
        cameraRef.current
      );
      raycasterHandlerRef.current.addClickCallback(handleIntersects);
      raycasterHandlerRef.current.addClickCallback(highlighterClickEffect);
      raycasterHandlerRef.current.addHoverCallback(highlighterHoverEffect);
      //setupRaycaster(sceneRef.current, cameraRef.current, handleIntersects);

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

      // const dirLight = new THREE.DirectionalLight(0xffffff, 10);
      // dirLight.position.set(100, 50, 100);
      // sceneRef.current.add(dirLight);

      // const light = new THREE.AmbientLight(0xffffff, 15); // soft white light
      // sceneRef.current.add(light);

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

      //add the debug plane
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
          // console.log("All assets loaded successfully!");
          // console.log(projectModels[0]);
          // console.log(projectModelsAnchors);
          // console.log(animationMixers);

          blenderCameraRef.current = blenderCamera;
          contact_model_CameraRef.current = contact_model_Camera;
          contact_models_animation_mixerRef.current =
            contact_models_animation_mixer;
          mixerRef.current = mixer;
          mixerArrayRef.current = animationMixers;
          scan_lines_meshRef.current = capsule_model;
          capsule_anchorRef.current = capsule_anchor;
          sceneRef.current.add(capsule_model);
          // transformControlRef.current.attach(projection_screen_anchor);
          // sceneRef.current.add(transformControlRef.current);

          //projection_object.material.uniforms.offset.value.y = 1;

          setUpProjectionScreen(projection_screen_anchor, cssSceneRef.current);
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

      setupGrid(rendererRef.current, loader, uniformsForGrid, sceneRef.current);

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
      composer.addPass(bloomPass);
      //composer.addPass(taaRenderPassRef.current);
      //composer.addPass(bokehPass);

      composer.addPass(new OutputPass());

      // const effectController = {
      //   focus: 500.0,
      //   aperture: 5,
      //   maxblur: 0.01,
      // };

      // const matChanger = function () {
      //   bokehPass.uniforms["focus"].value = effectController.focus;
      //   bokehPass.uniforms["aperture"].value =
      //     effectController.aperture * 0.00001;
      //   bokehPass.uniforms["maxblur"].value = effectController.maxblur;
      // };

      // const gui = new GUI();
      // gui.add(effectController, "focus", 0.1, 100.0, 0.1).onChange(matChanger);
      // gui.add(effectController, "aperture", 0, 10, 0.1).onChange(matChanger);
      // gui
      //   .add(effectController, "maxblur", 0.0, 0.01, 0.001)
      //   .onChange(matChanger);
      // gui.close();

      // matChanger();

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
        css3dRendererRef.current.setSize(
          canvasRef.current.width,
          canvasRef.current.height
        );

        cameraRef.current.updateProjectionMatrix();
      }

      // Animate the scene
      let time = 0;
      const animate = () => {
        animationIdRef.current = requestAnimationFrame(animate);

        positionProjectionScreen();
        //console.log(progressJSRef.current.value);

        // if (capsule_anchor) {
        //   console.log(capsule_anchor.position);
        // }

        if (cubeCamera != null)
          cubeCamera.update(rendererRef.current, sceneRef.current);

        //stats.update();

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

        // Render CSS3D scene
        css3dRendererRef.current.render(cssSceneRef.current, cameraRef.current);
        //composer.render();

        NodeToyMaterial.tick();
      };
      animate();
      window.addEventListener("resize", onWindowResize);

      // Cleanup when component unmounts
      return () => {
        cancelAnimationFrame(animationIdRef.current);
        renderer.dispose();
        document.body.removeChild(renderer.domElement);
      };
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
      const onComplete = () => {
        setIsGetStartedVisible(true);
        setInitialSequenceCompleted(true);
        console.log(capsule_body.rotation.y);
      };

      const logoAnimationTimeline = gsap.timeline({});
      animationTimelineRef.current = gsap.timeline({});
      aniSwquenceBeforeGetStarted(
        animationTimelineRef.current,
        progressJSRef.current,
        cameraRef.current,
        capsule_anchor,
        positionProjectionScreen,
        onComplete
      );
      // const clock = new THREE.Clock();
      // let previousTime = 0;
      // var speed = 0.1;
      // let delta = 0;
      // let previousProgress = 0.0;
      // let Currentprogress = 0.0;
      // const cameraEndPosition = {
      //   x: -13,
      //   y: 4,
      //   z: -95,
      // };
      // const cameraTargetPosition = {
      //   x: 53.8746,
      //   y: 0.041356,
      //   z: -30.8687,
      // };
      // const capsuleEndPosition = {
      //   x: 26.844, // blender_x
      //   y: -5, // blender_z
      //   z: -83.10922187556825, // -1 * blender_y
      // };
      // const capsuleEndRotation = {
      //   x: (0 * Math.PI) / 180, // blender_x
      //   y: (0 * Math.PI) / 180, // blender_z
      //   z: (0 * Math.PI) / 180, // -1 * blender_y
      // };
      // const logoAnimationTimeline = gsap.timeline({});
      // animationTimelineRef.current = gsap.timeline({});
      // // const animateLogo = gsap.timeline({});
      // // const animateCamera = gsap.timeline({});
      // // const animateCapsule = gsap.timeline({});
      // const animateLogo = logoAnimationTimeline.to(progressJSRef.current, {
      //   delay: 2,
      //   value: 0.2,
      //   duration: 20,
      // });
      // const animateCamera = animationTimelineRef.current.to(
      //   cameraRef.current.position,
      //   {
      //     ...cameraEndPosition,
      //     // x: 21.8609, // blender_x
      //     // y: 0.041356, // blender_z
      //     // z: -67.348, // -1 * blender_y
      //     delay: 5,
      //     duration: 5,
      //     ease: CustomEase.create(
      //       "custom",
      //       "M0,0 C0.106,0 0.195,0.008 0.288,0.063 0.513,0.198 0.589,0.618 0.714,0.829 0.797,0.97 0.893,1 1,1 "
      //     ),
      //     onStart: () => {
      //       let target = { x: 0, y: 0, z: 0 };
      //       gsap.to(target, {
      //         ...cameraTargetPosition,
      //         duration: 5,
      //         ease: CustomEase.create(
      //           "custom",
      //           "M0,0 C0.106,0 0.195,0.008 0.288,0.063 0.513,0.198 0.589,0.618 0.714,0.829 0.797,0.97 0.893,1 1,1 "
      //         ),
      //         onUpdate: () => {
      //           cameraRef.current.lookAt(target.x, target.y, target.z);
      //         },
      //       });
      //       gsap.to(cameraRef.current, {
      //         fov: 50,
      //         duration: 5,
      //         onUpdate: () => {
      //           cameraRef.current.updateProjectionMatrix();
      //         },
      //       });
      //     },
      //     onComplete: () => {},
      //   }
      // );
      // const animateCapsule = animationTimelineRef.current.to(
      //   capsule_anchor.position,
      //   {
      //     ...capsuleEndPosition,
      //     // delay: 10,
      //     duration: 4,
      //     ease: CustomEase.create(
      //       "custom",
      //       "M0,0 C0.106,0 0.195,0.008 0.288,0.063 0.513,0.198 0.589,0.618 0.714,0.829 0.797,0.97 0.893,1 1,1 "
      //     ),
      //     onStart: () => {
      //       // let target = { x: 0, y: 0, z: 0 };
      //       // gsap.to(target, {
      //       //   x: cameraRef.current.position.x,
      //       //   y: cameraRef.current.position.y,
      //       //   z: cameraRef.current.position.z,
      //       //   duration: 5,
      //       //   ease: CustomEase.create(
      //       //     "custom",
      //       //     "M0,0 C0.106,0 0.195,0.008 0.288,0.063 0.513,0.198 0.589,0.618 0.714,0.829 0.797,0.97 0.893,1 1,1 "
      //       //   ),
      //       //   onUpdate: () => {
      //       //     capsule_anchor.lookAt(target.x, target.y, target.z);
      //       //   },
      //       // });
      //       let targetRotation = { x: 0, y: (180 * Math.PI) / 180, z: 0 };
      //       gsap.to(targetRotation, {
      //         ...capsuleEndRotation,
      //         duration: 4,
      //         ease: CustomEase.create(
      //           "custom",
      //           "M0,0 C0.106,0 0.195,0.008 0.288,0.063 0.513,0.198 0.589,0.618 0.714,0.829 0.797,0.97 0.893,1 1,1 "
      //         ),
      //         onUpdate: () => {
      //           capsule_anchor.rotation.y = targetRotation.y;
      //         },
      //       });
      //     },
      //     onUpdate: () => {
      //       positionProjectionScreen();
      //     },
      //     onComplete: () => {
      //       setIsGetStartedVisible(true);
      //       setInitialSequenceCompleted(true);
      //       console.log(capsule_body.rotation.y);
      //     },
      //   }
      // );
    }
  }, [isStartingMessageVisible, assetsLoadedSuccessfully]);

  useEffect(() => {
    if (initialSequenceCompleted && !isGetStartedVisible) {
    }
  }, [initialSequenceCompleted, isGetStartedVisible]);

  // const aniSequenceAfterGetStarted = () => {
  //   const cameraLeftPanEndPos = { x: 0.0, y: 4, z: -105.943 };
  //   const cameraForwardPanEndPos = {
  //     x: 26.844, // blender_x
  //     y: 4, // blender_z
  //     z: -83.10922187556825, // -1 * blender_y
  //   };

  //   let cameraTimeline = gsap.timeline();
  //   const cameraLeftPan = cameraTimeline.to(cameraRef.current.position, {
  //     ...cameraLeftPanEndPos,
  //     duration: 1,
  //     ease: CustomEase.create(
  //       "custom",
  //       "M0,0 C0.106,0 0.195,0.008 0.288,0.063 0.513,0.198 0.589,0.618 0.714,0.829 0.797,0.97 0.893,1 1,1 "
  //     ),
  //   });
  //   // const cockpit_canopyDrop = cameraTimeline.to(cockpit_canopy.scale, {
  //   //   x: 1,
  //   //   y: 0,
  //   //   z: 1,
  //   //   duration: 1,
  //   //   ease: CustomEase.create(
  //   //     "custom",
  //   //     "M0,0 C0.106,0 0.195,0.008 0.288,0.063 0.513,0.198 0.589,0.618 0.714,0.829 0.797,0.97 0.893,1 1,1 "
  //   //   ),
  //   // });
  //   const cameraForwardPan = cameraTimeline.to(cameraRef.current.position, {
  //     ...cameraForwardPanEndPos,
  //     duration: 1,
  //     delay: 1,
  //     ease: CustomEase.create(
  //       "custom",
  //       "M0,0 C0.106,0 0.195,0.008 0.288,0.063 0.513,0.198 0.589,0.618 0.714,0.829 0.797,0.97 0.893,1 1,1 "
  //     ),
  //     onStart: () => {
  //       // const cameraTargetPosition = {
  //       //   x: 53.8746,
  //       //   y: 0.041356,
  //       //   z: -30.8687,
  //       // };
  //       // let target = { x: 0, y: 0, z: 0 };
  //       // gsap.to(target, {
  //       //   ...cameraTargetPosition,
  //       //   duration: 5,
  //       //   ease: CustomEase.create(
  //       //     "custom",
  //       //     "M0,0 C0.106,0 0.195,0.008 0.288,0.063 0.513,0.198 0.589,0.618 0.714,0.829 0.797,0.97 0.893,1 1,1 "
  //       //   ),
  //       //   onUpdate: () => {
  //       //     cameraRef.current.lookAt(target.x, target.y, target.z);
  //       //   },
  //       //   onComplete: () => {
  //       //     controlsRef.current.enabled = true;
  //       //   },
  //       // });
  //     },
  //     onComplete: () => {
  //       //controlsRef.current.enabled = true;
  //       startSequenceCompleteRef.current = true;
  //       setIsHamburgerMenuVisible(true);

  //       currentUserPositionRef.current = "Menu Item 1";
  //       addScrollTrigger();
  //     },
  //   });
  // };

  useEffect(() => {
    if (getStartedCompleted) {
      const callback = () => {
        //controlsRef.current.enabled = true;
        startSequenceCompleteRef.current = true;
        setIsHamburgerMenuVisible(true);

        currentUserPositionRef.current = "Menu Item 1";
        addScrollTrigger();
      };
      aniSequenceAfterGetStarted(cameraRef.current, callback);
    }
  }, [getStartedCompleted]);

  useEffect(() => {
    if (startSequenceCompleteRef.current) {
    }
  }, [startSequenceCompleteRef.current]);

  // useEffect(() => {
  //   console.log(currentUserPositionRef.current + " => useEffect");
  //   if (currentUserPositionRef.current == "home") {
  //     animateToProgress(0.0);
  //     tweenCameraToNewPositionAndRotation(
  //       cameraRef.current, //camera,
  //       controlsRef.current, //controls,
  //       { x: 0, y: 0, z: 0 }, //cameraTarget,
  //       { x: 0, y: 100, z: 0 } //newPosition,
  //       // { x: 0, y: 0, z: 0 } //newRotation
  //     ); //0.0
  //   } else if (currentUserPositionRef.current == "Menu Item 1") {
  //     tweenCameraToNewPositionAndRotation(
  //       cameraRef.current, //camera,
  //       controlsRef.current, //controls,
  //       { x: 0, y: 0, z: 0 }, //cameraTarget,
  //       {
  //         x: 26.844,
  //         y: 4,
  //         z: -83.10922187556825,
  //       }
  //       // { x: 0, y: 0, z: 0 } //newRotation
  //     ); //0.0
  //   } else if (currentUserPositionRef.current == "Menu Item 2") {
  //     animateToProgress(0.0);
  //     tweenCameraToNewPositionAndRotation(
  //       cameraRef.current, //camera,
  //       controlsRef.current, //controls,
  //       { x: 53.8746, y: 0.041356, z: -30.8687 }, //cameraTarget,
  //       { x: -13, y: 4, z: -95 } //newPosition,
  //       // { x: 0, y: 0, z: 0 } //newRotation
  //     ); //0.0
  //   } else if (currentUserPositionRef.current == "menu item 3") {
  //     tweenCameraToNewPositionAndRotation(
  //       cameraRef.current, //camera,
  //       controlsRef.current, //controls,
  //       { x: 0, y: 0, z: 0 }, //cameraTarget,
  //       { x: -13, y: 4, z: -95 }, //newPosition,
  //       { x: 0, y: 0, z: 0 } //newRotation
  //     ); //0.0
  //   }
  // }, [currentUserPositionRef.current]);

  let old_pos = null;
  function actOnUserPositionChange() {
    const current_pos = currentUserPositionRef.current;
    console.log(currentUserPositionRef.current + " => useEffect");

    // Helper function to stop the video asynchronously and then resolve the promise
    const stopVideoIfLoaded = async () => {
      return new Promise((resolve, reject) => {
        if (iframe && iframe.contentWindow) {
          // Ensure the iframe is visible and the content is ready before sending postMessage
          iframe.contentWindow.postMessage(
            '{"event":"command","func":"stopVideo","args":""}',
            "*"
          );
          console.log("Video stop command sent.");

          // Simulate a small delay to ensure the message is processed
          setTimeout(() => {
            resolve(); // Video stop process complete
          }, 100); // Adjust delay as necessary to fit your iframe's response time
        } else {
          console.error("Iframe is not ready or contentWindow is unavailable.");
          reject("Iframe not ready");
        }
      });
    };

    // Check if the user position has changed
    if (old_pos != current_pos) {
      // Handling the "home" position
      if (currentUserPositionRef.current == "home") {
        stopVideoIfLoaded()
          .then(() => {
            hideiFrame(); // Hide the iframe after video stops
            animateToProgress(0.0).then(() => {
              if (productCameraTravelScrollTriggerRef.current != null) {
                productCameraTravelScrollTriggerRef.current.kill();
                productCameraTravelScrollTriggerRef.current = null;
              }
              if (contactsSceneCameraTravelScrollTriggerRef.current != null) {
                contactsSceneCameraTravelScrollTriggerRef.current.kill();
                contactsSceneCameraTravelScrollTriggerRef.current = null;
              }
            });

            sceneRef.current.remove(capsule_anchorRef.current);
            sceneRef.current.remove(projection_object);
            sceneRef.current.remove(social_media_models_scene);

            teamScene.removeFromScene();

            tweenCameraToNewPositionAndRotation(
              cameraRef.current,
              controlsRef.current,
              currentCameraTargetRef.current,
              { x: 0, y: 0, z: 0 }, // Target position
              { x: 0, y: 100, z: 0 } // New camera position
            );
            currentCameraTargetRef.current = { x: 0, y: 0, z: 0 };
          })
          .catch((error) => {
            console.error("Failed to stop video: ", error);
          });
      } else if (currentUserPositionRef.current == "Menu Item 1") {
        stopVideoIfLoaded()
          .then(() => {
            hideiFrame();
            iframe.style.display = "none";
            sceneRef.current.remove(social_media_models_scene);

            if (capsule_anchorRef.current.visible) {
              if (
                animateCapsuleRotation(
                  null,
                  capsule_body,
                  projection_object,
                  projected_screen,
                  iframe
                )
              ) {
                sceneRef.current.remove(capsule_anchorRef.current);
                sceneRef.current.remove(projection_object);
              }
            }

            if (productCameraTravelScrollTriggerRef.current == null) {
              addScrollTrigger();
            }

            teamScene.removeFromScene();

            tweenCameraToNewPositionAndRotation(
              cameraRef.current,
              controlsRef.current,
              currentCameraTargetRef.current,
              { x: 53.8746, y: -0.43, z: -30.8687 }, // Target position
              { x: 21.893, y: -0.43, z: -67.042 } // New camera position
            );
            currentCameraTargetRef.current = {
              x: 53.8746,
              y: -0.43,
              z: -30.8687,
            };
          })
          .catch((error) => {
            console.error("Failed to stop video: ", error);
          });
      } else if (currentUserPositionRef.current == "Menu Item 2") {
        sceneRef.current.remove(social_media_models_scene);
        showiFrame();

        capsule_anchorRef.current.visible = true;
        projected_screen.visible = true;

        animateToProgress(0.0).then(() => {
          if (productCameraTravelScrollTriggerRef.current != null) {
            productCameraTravelScrollTriggerRef.current.kill();
            productCameraTravelScrollTriggerRef.current = null;
          }
          if (contactsSceneCameraTravelScrollTriggerRef.current != null) {
            contactsSceneCameraTravelScrollTriggerRef.current.kill();
            contactsSceneCameraTravelScrollTriggerRef.current = null;
          }
        });

        teamScene.removeFromScene();

        tweenCameraToNewPositionAndRotation(
          cameraRef.current,
          controlsRef.current,
          currentCameraTargetRef.current,
          { x: 53.8746, y: 0.041, z: -30.8687 }, // Target position
          { x: -13, y: 4, z: -95 } // New camera position
        );
        currentCameraTargetRef.current = { x: 53.8746, y: 0.041, z: -30.8687 };
      } else if (currentUserPositionRef.current == "Menu Item 3") {
        stopVideoIfLoaded()
          .then(() => {
            capsule_anchorRef.current.visible = false;
            hideiFrame();
            iframe.style.display = "none";

            sceneRef.current.add(social_media_models_scene);

            if (capsule_anchorRef.current.visible) {
              if (
                animateCapsuleRotation(
                  null,
                  capsule_body,
                  projection_object,
                  projected_screen,
                  iframe
                )
              ) {
                sceneRef.current.remove(capsule_anchorRef.current);
                sceneRef.current.remove(projection_object);
              }
            }

            animateToProgress(0.0).then(() => {
              addScrollTriggerForContactsModels();
            });

            teamScene.removeFromScene();

            tweenCameraToNewPositionAndRotation(
              cameraRef.current,
              controlsRef.current,
              currentCameraTargetRef.current,
              { x: 34.0748, y: 7.38414, z: -93.5994 }, // Target position
              {
                x: -192.7404,
                y: 121.7475,
                z: -337.4154,
              } // New camera position
            );
            currentCameraTargetRef.current = {
              x: 34.0748,
              y: 7.38414,
              z: -93.5994,
            };
          })
          .catch((error) => {
            console.error("Failed to stop video: ", error);
          });
      } else if (currentUserPositionRef.current == "Menu Item 4") {
        stopVideoIfLoaded()
          .then(() => {
            hideiFrame(); // Hide the iframe after video stops
            animateToProgress(0.0).then(() => {
              if (productCameraTravelScrollTriggerRef.current != null) {
                productCameraTravelScrollTriggerRef.current.kill();
                productCameraTravelScrollTriggerRef.current = null;
              }
              if (contactsSceneCameraTravelScrollTriggerRef.current != null) {
                contactsSceneCameraTravelScrollTriggerRef.current.kill();
                contactsSceneCameraTravelScrollTriggerRef.current = null;
              }
            });

            sceneRef.current.remove(capsule_anchorRef.current);
            sceneRef.current.remove(projection_object);
            sceneRef.current.remove(social_media_models_scene);

            tweenCameraToNewPositionAndRotation(
              cameraRef.current,
              controlsRef.current,
              currentCameraTargetRef.current,
              { x: 55.0009, y: 2.47723, z: 107.594 }, // Target position
              { x: 54.4541, y: 6.28496, z: 51.9438 } // New camera position
            );
            currentCameraTargetRef.current = {
              x: 55.0009,
              y: 2.47723,
              z: 107.594,
            };

            teamScene.addToScene();
          })
          .catch((error) => {
            console.error("Failed to stop video: ", error);
          });
      } else if (currentUserPositionRef.current == "Menu Item 5") {
        stopVideoIfLoaded()
          .then(() => {
            hideiFrame(); // Hide the iframe after video stops
            animateToProgress(0.0).then(() => {
              if (productCameraTravelScrollTriggerRef.current != null) {
                productCameraTravelScrollTriggerRef.current.kill();
                productCameraTravelScrollTriggerRef.current = null;
              }
              if (contactsSceneCameraTravelScrollTriggerRef.current != null) {
                contactsSceneCameraTravelScrollTriggerRef.current.kill();
                contactsSceneCameraTravelScrollTriggerRef.current = null;
              }
            });

            sceneRef.current.remove(capsule_anchorRef.current);
            sceneRef.current.remove(projection_object);
            sceneRef.current.remove(social_media_models_scene);
            teamScene.removeFromScene();

            tweenCameraToNewPositionAndRotation(
              cameraRef.current,
              controlsRef.current,
              currentCameraTargetRef.current,
              { x: 55.0009, y: 2.47723, z: 107.594 }, // Target position
              { x: 54.4541, y: 6.28496, z: 51.9438 } // New camera position
            );
            currentCameraTargetRef.current = {
              x: 55.0009,
              y: 2.47723,
              z: 107.594,
            };

            printerScene.addToScene();
          })
          .catch((error) => {
            console.error("Failed to stop video: ", error);
          });
      }

      // Update the old position
      old_pos = current_pos;
    }
  }

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

  function positionProjectionScreen() {
    if (projection_screen_anchor != null && projected_screen) {
      // console.log(
      //   "screen object : " +
      //     JSON.stringify(projected_screen.position.toArray()) +
      //     " anchor : " +
      //     JSON.stringify(projection_screen_anchor.position.toArray())
      // );

      // Copy world position
      projected_screen.position.copy(
        projection_screen_anchor.getWorldPosition(new THREE.Vector3())
      );

      // Copy world rotation (as a quaternion)
      projected_screen.quaternion.copy(
        projection_screen_anchor.getWorldQuaternion(new THREE.Quaternion())
      );
    }
  }

  function addScrollTriggerForContactsModels() {
    // Kill the product scroll trigger if it exists
    if (productCameraTravelScrollTriggerRef.current) {
      productCameraTravelScrollTriggerRef.current.kill();
      productCameraTravelScrollTriggerRef.current = null; // Reset reference
    }

    console.log(contactsSceneCameraTravelScrollTriggerRef.current);
    if (contactsSceneCameraTravelScrollTriggerRef.current == null) {
      console.log("adding contacts model scroll trigger");
      contactsSceneCameraTravelScrollTriggerRef.current = ScrollTrigger.create({
        trigger: "#container",
        start: "top",
        end: "20000",
        pin: true,
        markers: true,
        onUpdate: (self) => {
          const min = 0.15;
          const max = 1.0;

          let progressForProductAnimation = Math.max(
            0.0,
            Math.min(1.0, (self.progress - 0.15) / (1 - 0.15))
          );

          onMouseScrollForContactsModels(self.progress);

          if (
            contact_model_CameraRef.current != null &&
            currentUserPositionRef.current == "Menu Item 3"
          ) {
            cameraRef.current.position.copy(
              contact_model_CameraRef.current.position
            );
            cameraRef.current.rotation.copy(
              contact_model_CameraRef.current.rotation
            );
            cameraRef.current.quaternion.copy(
              contact_model_CameraRef.current.quaternion
            );
            cameraRef.current.updateMatrix();
          }
        },
      });
    }
  }

  function addScrollTrigger() {
    // Kill the contacts scroll trigger if it exists
    if (contactsSceneCameraTravelScrollTriggerRef.current) {
      contactsSceneCameraTravelScrollTriggerRef.current.kill();
      contactsSceneCameraTravelScrollTriggerRef.current = null; // Reset reference
    }

    console.log("adding scroll trigger");
    logoAnimationCompletedRef.current = true;
    productCameraTravelScrollTriggerRef.current = ScrollTrigger.create({
      trigger: "#container",
      start: "top",
      end: "25000",
      pin: true,
      onUpdate: (self) => {
        const min = 0.15;
        const max = 1.0;

        progressJSRef.current.value = self.progress * (max - min) + min;

        let progressForProductAnimation = Math.max(
          0.0,
          Math.min(1.0, (self.progress - 0.15) / (1 - 0.15))
        );

        onMouseScroll(progressForProductAnimation);

        if (
          blenderCameraRef.current != null &&
          currentUserPositionRef.current == "Menu Item 1"
        ) {
          cameraRef.current.position.copy(blenderCameraRef.current.position);
          cameraRef.current.position.y =
            blenderCameraRef.current.position.y - 3;
          cameraRef.current.rotation.copy(blenderCameraRef.current.rotation);
          cameraRef.current.quaternion.copy(
            blenderCameraRef.current.quaternion
          );
          cameraRef.current.updateMatrix();
        }
      },
    });

    //

    // ScrollTrigger.current.observe({
    //   trigger: "#container",
    //   type: "touch,pointer", // comma-delimited list of what to listen for ("wheel,touch,scroll,pointer")
    //   onUp: () => {
    //     ScrollTrigger.current.refresh();
    //   },
    // });
  }

  function animateToProgress(targetProgress) {
    return new Promise((resolve, reject) => {
      // Get the total scrollable distance
      const totalScroll = 25000; //ScrollTrigger.maxScroll(window);

      // Calculate the scroll position based on the target progress
      const targetScroll = totalScroll * targetProgress;

      // Use gsap to animate the scroll position smoothly
      gsap.to(window, {
        scrollTo: targetScroll,
        duration: 3, // Adjust the duration for smoothness
        ease: "power2.inOut", // You can change the easing for different effects
        onUpdate: () => {
          if (productCameraTravelScrollTriggerRef.current != null) {
            productCameraTravelScrollTriggerRef.current.refresh(); // Refresh ScrollTrigger on update to ensure correct behavior
          }
        },
        onComplete: () => {
          resolve();
        },
      });
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

  function onMouseScrollForContactsModels(progress) {
    if (contact_models_animation_mixerRef.current != null) {
      const elapsedTime = progress * 11.0; //totalAnimationSeconds;
      contact_models_animation_mixerRef.current.setTime(elapsedTime);
      animateSpotLights(spot_lights_array, progress);
    }
  }

  function onMouseScroll(progress) {
    if (mixerRef.current !== null) {
      const elapsedTime = progress * totalAnimationSeconds;

      mixerRef.current.setTime(elapsedTime);
      mixerArrayRef.current.forEach((mixer) => {
        mixer.setTime(elapsedTime);
        mixer._root.updateMatrix();
      });
    }
  }

  //let previousTime = 0;

  // function onMouseScroll(progress) {
  //   if (mixerRef.current !== null) {
  //     const elapsedTime = progress * totalAnimationSeconds;

  //     // Interpolation factor
  //     const delta = 0.1; // Adjust this for smoothness
  //     const smoothTime = THREE.MathUtils.lerp(previousTime, elapsedTime, delta);

  //     mixerRef.current.setTime(smoothTime);
  //     mixerArrayRef.current.forEach((mixer) => {
  //       mixer.setTime(smoothTime);
  //       mixer._root.updateMatrix();
  //     });

  //     previousTime = smoothTime; // Store the current time for the next frame
  //   }
  // }

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

  const selectedItemInMainMenu = (item) => {
    currentUserPositionRef.current = item;
    actOnUserPositionChange();
  };

  // const selectedItemInMainMenu = (item) => {
  //   switch (item) {
  //     case "home":
  //       tweenCameraToNewPositionAndRotation(
  //         cameraRef.current,
  //         controlsRef.current,
  //         { x: 53.8746, y: 0.041356, z: -30.8687 },
  //         { x: -13, y: 4, z: -95 },
  //         null
  //         // { x: 0, y: 0, z: 0 }
  //       ); //0.0
  //       break;

  //     case "Car Configurator":
  //       tweenCameraToNewPositionAndRotation(
  //         cameraRef.current, //camera,
  //         controlsRef.current, //controls,
  //         { x: 0, y: 0, z: 0 }, //cameraTarget,
  //         { x: -13, y: 4, z: -95 }, //newPosition,
  //         { x: 0, y: 0, z: 0 } //newRotation
  //       ); //0.0
  //       break;
  //     default:
  //       console.warn("Unknown item");
  //   }
  // };

  const selectedItemInSubMenu1 = (item) => {
    console.log(item);
    switch (item) {
      // case "home":
      //   animateToProgress(0.0); //0.0
      //   break;
      case "Car Configurator":
        animateToProgress(0.2); //0.12;
        break;
      case "MetaRealty":
        animateToProgress(0.34); //0.258
        break;
      case "Virtual Production":
        animateToProgress(0.51); //0.403
        break;
      case "Edulab":
        animateToProgress(0.64); //0.5
        break;
      case "Fashion-IX":
        animateToProgress(0.78); //0.629
        break;
      case "Virtual Mart":
        animateToProgress(0.92); //0.774
        break;
      default:
        console.warn("Unknown item");
    }
  };

  const selectedItemInSubMenu2 = (item) => {
    console.log(item);
    switch (item) {
      case "home":
        animateCapsuleRotation(
          intersects[0].object,
          capsule_body,
          projection_object,
          projected_screen,
          iframe
        );
        break;
      case "Meta Realty":
        animateCapsuleRotation(
          legs_parent.children[0].children[0],
          capsule_body,
          projection_object,
          projected_screen,
          iframe
        );
        break;
      case "Car Configurator":
        animateCapsuleRotation(
          legs_parent.children[1].children[0],
          capsule_body,
          projection_object,
          projected_screen,
          iframe
        );
        break;
      case "Fashion IX":
        animateCapsuleRotation(
          legs_parent.children[2].children[0],
          capsule_body,
          projection_object,
          projected_screen,
          iframe
        );
        break;
      case "Edulab":
        animateCapsuleRotation(
          legs_parent.children[3].children[0],
          capsule_body,
          projection_object,
          projected_screen,
          iframe
        );
        break;
      case "Virtual Mart":
        animateCapsuleRotation(
          legs_parent.children[4].children[0],
          capsule_body,
          projection_object,
          projected_screen,
          iframe
        );
        break;
      case "Virtual Museum":
        animateCapsuleRotation(
          legs_parent.children[5].children[0],
          capsule_body,
          projection_object,
          projected_screen,
          iframe
        );
        break;
      default:
        console.warn("Unknown item");
    }
  };

  const selectedItemInSubMenu3 = (item) => {
    switch (item) {
      case "facebook":
        break;
      default:
        console.warn("Unknown item");
    }
  };

  const toggleChildComponent = () => {
    if (!showChild) {
      // Stop the parent component's Three.js rendering
      cancelAnimationFrame(animationIdRef.current);
    }
    setShowChild((prev) => !prev);
  };

  return (
    <div id="container">
      <div className={styles.slidecontainer}>
        {/* <div id="rotation_slider" className={styles.rotation_slider}>
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
        </div> */}

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
      {/* {<Beepie />} */}
      {isStartingMessageVisible && (
        <StartingMessage continue={startingMessageContinue} />
      )}
      {isGetStartedVisible && <GetStarted continue={GetStartedContinue} />}
      {/* {isStartingMessageVisible && <GetStarted />} */}
      {isHamburgerMenuVisible && (
        <HamburgerMenu
          handleClickTopLevelMenuProp={selectedItemInMainMenu}
          selectedItemSubMenu1={selectedItemInSubMenu1}
          selectedItemSubMenu2={selectedItemInSubMenu2}
          selectedItemSubMenu3={selectedItemInSubMenu3}
          openModelViewer={toggleChildComponent}
        />
      )}
      {isHamburgerMenuVisible && <Beepie />}
      {showChild && <Model_viewer />}
    </div>
  );
}
