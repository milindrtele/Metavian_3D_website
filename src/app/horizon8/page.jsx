"use client";

import { useRef, useState, useEffect } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { TransformControls } from "three/addons/controls/TransformControls.js";
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
import { mat2 } from "three/examples/jsm/nodes/Nodes";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import PositionAlongPathState from "../lib/positionAlongPathTools/PositionAlongPathState.js";
import {
  handleScroll,
  updatePosition,
} from "../lib/positionAlongPathTools/PositionAlongPathMethods.js";
import { loadCurveFromJSON } from "../lib/curveTools/CurveMethods.js";

export default function Horizon() {
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
  let dummy = new THREE.Object3D();
  let dummy2 = new THREE.Object3D();
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

  const targetObject = new THREE.Object3D();

  gsap.registerPlugin(ScrollTrigger);

  function loadAssetsWithPromise() {
    return new Promise((resolve, reject) => {
      let loadedModels = 0;
      const totalModels = 5;

      const checkIfAllLoaded = () => {
        loadedModels++;
        if (loadedModels === totalModels) {
          modelLoaded = true;
          resolve();
        }
      };

      const loadModels = (
        index,
        url,
        anchorName,
        position,
        rotation,
        scale,
        name
      ) => {
        loader.load(
          url,
          (gltf) => {
            //models/optimised_product_models/fashion_IX_v2.glb

            const assetScene = gltf.scene;
            assetScene.name = name;
            const assetAnchor = assetScene.getObjectByName(anchorName);
            if (position != null)
              assetAnchor.position.set(position.x, position.y, position.z); // position the product asset
            if (rotation != null)
              assetAnchor.rotation.set(
                (Math.PI / 180) * rotation.x,
                (Math.PI / 180) * rotation.y,
                (Math.PI / 180) * rotation.z
              ); // rotate the product asset
            if (scale != null) assetAnchor.scale.set(scale.x, scale.y, scale.z); // scale the product asset

            productAssetsRef.current[index] = assetScene;
            productAssetAnchorRef.current[index] = assetAnchor;
            let last = productAssetAnchorRef.current.length - 1;
            //sceneRef.current.add(assetScene); // add to the scene
            transformControlRef.current.attach(
              productAssetAnchorRef.current[last]
            ); // attach the gimble
            sceneRef.current.add(transformControlRef.current); // add the gimble to the scene
            checkIfAllLoaded();
          },
          undefined,
          reject
        );
      };

      loadModels(
        //url, anchorName, position, rotation, scale
        0,
        "models/positioned assets/car_config_v1.glb",
        "anchor",
        null, // position
        null, // rotation in degrees
        null, // scale
        "car_configurator"
      );
      loadModels(
        //url, anchorName, position, rotation, scale
        1,
        "models/positioned assets/virtual_mart_v1.glb",
        "anchor",
        null, // position
        null, // rotation in degrees
        null, // scale
        "virtual_mart"
      );
      loadModels(
        //url, anchorName, position, rotation, scale
        2,
        "models/positioned assets/fashion_ix_v1.glb",
        "anchor",
        null, // position
        null, // rotation in degrees
        null, // scale
        "fashion_ix"
      );
      loadModels(
        //url, anchorName, position, rotation, scale
        3,
        "models/positioned assets/digital_twin.glb",
        "anchor",
        null, // position
        null, // rotation in degrees
        null, // scale
        "digital_twin"
      );
      loadModels(
        //url, anchorName, position, rotation, scale
        4,
        "models/positioned assets/edulab_v1.glb",
        "anchor",
        null, // position
        null, // rotation in degrees
        null, // scale
        "edulab_v1"
      );
      loadModels(
        //url, anchorName, position, rotation, scale
        5,
        "models/positioned assets/virtual_production.glb",
        "anchor",
        null, // position
        null, // rotation in degrees
        null, // scale
        "virtual_production"
      );
      loadModels(
        //url, anchorName, position, rotation, scale
        6,
        "models/positioned assets/meta_realty.glb",
        "anchor",
        null, // position
        null, // rotation in degrees
        null, // scale
        "meta_realty"
      );
    });
  }

  function loadAssets(url, anchorName, position, rotation, scale, name) {
    loader.load(url, (gltf) => {
      //models/optimised_product_models/fashion_IX_v2.glb

      const assetScene = gltf.scene;
      assetScene.name = name;
      console.log(assetScene);
      const assetAnchor = assetScene.getObjectByName(anchorName);
      if (position != null)
        assetAnchor.position.set(position.x, position.y, position.z); // position the product asset
      if (rotation != null)
        assetAnchor.rotation.set(
          (Math.PI / 180) * rotation.x,
          (Math.PI / 180) * rotation.y,
          (Math.PI / 180) * rotation.z
        ); // rotate the product asset
      if (scale != null) assetAnchor.scale.set(scale.x, scale.y, scale.z); // scale the product asset

      productAssetsRef.current.push(assetScene);
      productAssetAnchorRef.current.push(assetAnchor);
      let last = productAssetAnchorRef.current.length - 1;
      //sceneRef.current.add(assetScene); // add to the scene
      transformControlRef.current.attach(productAssetAnchorRef.current[last]); // attach the gimble
      sceneRef.current.add(transformControlRef.current); // add the gimble to the scene
    });
  }

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
        step1: {
          value: new THREE.TextureLoader().load("/images/metavian-logo.png"),
        },
        step2: {
          value: new THREE.TextureLoader().load(
            "/images/islands/island-new.jpg"
          ),
        },
        step3: {
          value: new THREE.TextureLoader().load("/images/islands/01.jpg"),
        },
        step4: {
          value: new THREE.TextureLoader().load("/images/islands/02.jpg"),
        },
        step5: {
          value: new THREE.TextureLoader().load("/images/islands/03.jpg"),
        },
        step6: {
          value: new THREE.TextureLoader().load("/images/islands/04.jpg"),
        },
        step7: {
          value: new THREE.TextureLoader().load("/images/islands/05.jpg"),
        },
        step8: {
          value: new THREE.TextureLoader().load("/images/islands/06.jpg"),
        },
        step9: {
          value: new THREE.TextureLoader().load("/images/islands/07.jpg"),
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

      // rendererRef.current.shadowMap.enabled = true;
      // rendererRef.current.shadowMap.type = THREE.VSMShadowMap;

      rendererRef.current.setSize(window.innerWidth, window.innerHeight);

      // Create a camera and set its position and orientation
      cameraRef.current = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
      );
      cameraRef.current.position.set(0, 100, -1);
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
      controlsRef.current.enableZoom = false;
      controlsRef.current.enablePan = false;
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

      circlepath = await loadCurveFromJSON(
        sceneRef.current,
        "/curve_paths/curve_from_ashutosh.json"
      );

      targetPath = await loadCurveFromJSON(
        sceneRef.current,
        "/curve_paths/target_curve_from_ashutosh.json"
      );

      targetObject.position.set(0, 0, 0);

      //sceneRef.current.add(circlepath.mesh);

      cameraRef.current.position.copy(circlepath.curve.getPointAt(0));
      cameraRef.current.lookAt(targetObject.position);

      window.addEventListener("wheel", onMouseScroll, false);
      window.addEventListener("touchmove", onMouseScroll, false);

      function onMouseScroll(event) {
        handleScroll(event, positionAlongPathState);
      }

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

      // add the debug plane
      // console.log(fboRef.current.texture);
      // const debugPlaneGeo = new THREE.PlaneGeometry(20, 20);
      // const debugPlaneMat = new THREE.MeshBasicMaterial({
      //   //map: new THREE.TextureLoader().load("images/ring.jpg"),
      //   map: fboRef.current.texture,
      //   side: THREE.DoubleSide,
      // });
      // const debugPlaneMesh = new THREE.Mesh(debugPlaneGeo, debugPlaneMat);
      // debugPlaneMesh.position.set(0, 20, 0);
      // sceneRef.current.add(debugPlaneMesh);

      // const debugPlane2Geo = new THREE.PlaneGeometry(20, 20);
      // const debugPlane2Mat = new THREE.ShaderMaterial({
      //   uniforms: {
      //     time: timeUniform,
      //     uFBO: null,
      //     uProgress: progressJSRef.current,
      //     step1: {
      //       value: new THREE.TextureLoader().load("/images/metavian-logo.png"),
      //     },
      //     step2: {
      //       value: new THREE.TextureLoader().load("/images/ring2.jpg"),
      //     },
      //     step3: {
      //       value: new THREE.TextureLoader().load("/images/images.png"),
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

      loader.load("/models/hexa_with_edge_AO_3.glb", (gltf) => {
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
          color: 0x5d294f, //0x363636
          roughness: 0.3,
          // metalness: 1,
          // sheen: 1,
          // sheenColor: 0xadc921,
          // sheenRoughness: 0,
          aoMap: aoTexture,
        });
        let mat2 = new THREE.MeshPhysicalMaterial({
          color: 0x5d294f, //0x363636
          roughness: 0.3,
          // metalness: 1,
          // sheen: 1,
          // sheenColor: 0xadc921,
          // sheenRoughness: 0,
          aoMap: aoTexture,
        });

        uniformsForGrid = {
          bottom_level: { value: 0.1 },
          crest: { value: 100.0 },
          amplitude: { value: 100.0 },
          start_level: { value: 1.0 },
          frequency: { value: 10.0 },
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

        /////////////////////////////////////////////////////////////////////////////////

        const blankPlaneTexture = textureLoader.load("images/grid.png");
        blankPlaneTexture.wrapS = blankPlaneTexture.wrapT =
          THREE.RepeatWrapping;
        blankPlaneTexture.offset.set(0, 0);
        blankPlaneTexture.repeat.set(3000, 3000);
        const blankPlaneTextureNormal = textureLoader.load("images/baked.png");
        blankPlaneTextureNormal.wrapS = blankPlaneTextureNormal.wrapT =
          THREE.RepeatWrapping;
        blankPlaneTextureNormal.offset.set(0, 0);
        blankPlaneTextureNormal.repeat.set(4000, 4000);
        const blankPlaneGeo = new THREE.PlaneGeometry(10000, 10000);
        const blankPlaneMat = new THREE.MeshPhysicalMaterial({
          color: 0x393939,
          // /map: blankPlaneTexture,
          //roughnessMap: blankPlaneTexture,
          normalMap: blankPlaneTextureNormal,
          normalScale: new THREE.Vector2(0.5, 0.5),
          roughness: 0.01,
          transparent: true,
        });
        const blankPlaneMesh = new THREE.Mesh(blankPlaneGeo, blankPlaneMat);
        blankPlaneMesh.rotation.x = (Math.PI / 180) * -90;
        // blankPlaneMesh.rotation.z = (Math.PI / 180) * -90;
        blankPlaneMesh.position.set(0, -5.5, 0);
        //sceneRef.current.add(blankPlaneMesh);

        loader.load("/models/blank_plane.glb", (gltf) => {
          const blank_planeMesh = gltf.scene;
          blank_planeMesh.children[0].material = blankPlaneMat;
          //blank_planeMesh.scale.set(new THREE.Vector3(2, 1, 2));
          sceneRef.current.add(blank_planeMesh);
        });

        loadAssetsWithPromise();

        // loadAssetsWithPromise(
        //   //url, anchorName, position, rotation, scale
        //   "models/positioned assets/car_config_v1.glb",
        //   "anchor",
        //   null, // position
        //   null, // rotation in degrees
        //   null, // scale
        //   "car_configurator"
        // );
        // loadAssets(
        //   //url, anchorName, position, rotation, scale
        //   "models/positioned assets/virtual_mart_v1.glb",
        //   "anchor",
        //   null, // position
        //   null, // rotation in degrees
        //   null, // scale
        //   "virtual_mart"
        // );
        // loadAssets(
        //   //url, anchorName, position, rotation, scale
        //   "models/positioned assets/fashion_ix_v1.glb",
        //   "anchor",
        //   null, // position
        //   null, // rotation in degrees
        //   null, // scale
        //   "fashion_ix"
        // );
        // loadAssets(
        //   //url, anchorName, position, rotation, scale
        //   "models/positioned assets/digital_twin.glb",
        //   "anchor",
        //   null, // position
        //   null, // rotation in degrees
        //   null, // scale
        //   "digital_twin"
        // );
        // loadAssets(
        //   //url, anchorName, position, rotation, scale
        //   "models/positioned assets/edulab_v1.glb",
        //   "anchor",
        //   null, // position
        //   null, // rotation in degrees
        //   null, // scale
        //   "edulab_v1"
        // );

        // loadAssets(
        //   //url, anchorName, position, rotation, scale
        //   "models/optimised_product_models/fashion_IX_v2.glb",
        //   "anchor",
        //   new THREE.Vector3(33, 10, -54), // position
        //   new THREE.Vector3(0, 180, 0), // rotation in degrees
        //   new THREE.Vector3(4, 4, 4) // scale
        // );

        // loadAssets(
        //   //url, anchorName, position, rotation, scale
        //   "models/optimised_product_models/virtualmart_v2.glb",
        //   "anchor",
        //   new THREE.Vector3(63, 10, -10), // position
        //   new THREE.Vector3(0, 180, 0), // rotation in degrees
        //   new THREE.Vector3(4, 4, 4) // scale
        // );

        // loadAssets(
        //   //url, anchorName, position, rotation, scale
        //   "models/optimised_product_models/new_car_config_icon_model_update-v1.glb",
        //   "anchor",
        //   new THREE.Vector3(-32.97176363937228, 10, -57.888706181503174), // position
        //   new THREE.Vector3(0, 180, 0), // rotation in degrees
        //   new THREE.Vector3(5, 5, 5) // scale
        // );

        // let indexBlank = 0;
        // const blankRows = 500;
        // const blankCount = blankRows * blankRows;
        // let xSpacingBlank = 2; // original 1.73  // 2
        // let ySpacingBlank = 1.73; // original 1.5   // 1.73

        // let blankMat = new THREE.MeshBasicMaterial({
        //   color: 0x363636,
        //   roughness: 0.1,
        //   aoMap: aoTexture,
        // });

        // const blankInstancedMesh = new THREE.InstancedMesh(
        //   baseCubeRef.current.children[1].geometry, // Use the geometry of the loaded cube
        //   blankMat,
        //   blankCount
        // );
        // const blankInstancedMesh2 = new THREE.InstancedMesh(
        //   baseCubeRef.current.children[1].geometry, // Use the geometry of the loaded cube
        //   blankMat,
        //   blankCount
        // );
        // if (blankInstancedMesh.parent != sceneRef.current) {
        //   sceneRef.current.add(blankInstancedMesh);
        // }
        // if (blankInstancedMesh2.parent != sceneRef.current) {
        //   sceneRef.current.add(blankInstancedMesh2);
        // }
        // for (let i = 0; i < blankRows; i++) {
        //   for (let j = 0; j < blankRows; j++) {
        //     if (j % 2 == 1) {
        //       dummy.position.set(
        //         0.865 + i * xSpacingBlank - (blankRows * xSpacingBlank) / 2,
        //         -5,
        //         j * ySpacingBlank - (blankRows * ySpacingBlank) / 2
        //       );
        //       dummy2.position.set(
        //         0.865 + i * xSpacingBlank - (blankRows * xSpacingBlank) / 2,
        //         -5,
        //         j * ySpacingBlank - (blankRows * ySpacingBlank) / 2
        //       );
        //     } else {
        //       dummy.position.set(
        //         i * xSpacingBlank - (blankRows * xSpacingBlank) / 2,
        //         -5,
        //         j * ySpacingBlank - (blankRows * ySpacingBlank) / 2
        //       );
        //       dummy2.position.set(
        //         i * xSpacingBlank - (blankRows * xSpacingBlank) / 2,
        //         -5,
        //         j * ySpacingBlank - (blankRows * ySpacingBlank) / 2
        //       );
        //     }
        //     // instanceUV.set(
        //     //   [i / blankRows, j / blankRows],
        //     //   (i * blankRows + j) * 2
        //     // );
        //     // instance2UV.set(
        //     //   [i / blankRows, j / blankRows],
        //     //   (i * blankRows + j) * 2
        //     // );

        //     dummy.updateMatrix();
        //     dummy2.updateMatrix();
        //     if (i <= 250 && j <= 250) {
        //       blankInstancedMesh.setMatrixAt(indexBlank, dummy.matrix);
        //       blankInstancedMesh2.setMatrixAt(indexBlank++, dummy2.matrix);
        //     }
        //   }
        // }

        let rows = 250;
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

        if (instancedMeshRef.current.parent != sceneRef.current) {
          sceneRef.current.add(instancedMeshRef.current);
        }
        if (instancedMesh2Ref.current.parent != sceneRef.current) {
          sceneRef.current.add(instancedMesh2Ref.current);
        }

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
          shader.uniforms = Object.assign(shader.uniforms, uniformsForGrid);
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
          uniform float bottom_level;
          uniform float crest;
          uniform float amplitude;
          uniform float start_level;
          uniform float frequency;
          `
          );
          shader.vertexShader = shader.vertexShader.replace(
            "#include <begin_vertex>",
            `
          #include <begin_vertex>

          //float bottom_level = bottom_levelJS;
          //float crest = crestJS;
          //float amplitude = amplitudeJS;
          //float start_level = start_levelJS;
          //float frequency = frequencyJS;
          
          
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

          //float vAmplitude = (aRandom + sin(time * frequency * aRandom ) + start_level) * transition.g * crest * ////overallAnimationLevel / 40.0; 
          float vAmplitude = ((sin(time * frequency * aRandom )) + aRandom + start_level) * transition.g;
          //float normalized_vAmplitude = clamp((vAmplitude - bottom_level) / (crest - bottom_level), 0.0, crest);
          float normalized_vAmplitude = clamp(vAmplitude, 0.0, crest);

          transformed.y += normalized_vAmplitude;
          
          vHeight = transformed.y;
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
          shader.uniforms = Object.assign(shader.uniforms, uniformsForGrid);
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
          varying float randomNumber;
          varying float rValue;

          attribute vec2 instanceUV;
          attribute float aRandom;
          uniform float rotationAngle;
          uniform float vScale;
          uniform float vScaleRing;
          uniform float overallAnimationLevel;
          uniform float bottom_level;
          uniform float crest;
          uniform float amplitude;
          uniform float start_level;
          uniform float frequency;
          `
          );
          shader.vertexShader = shader.vertexShader.replace(
            "#include <begin_vertex>",
            `
          #include <begin_vertex>

          //float bottom_level = bottom_levelJS;
          //float crest = crestJS;
          //float amplitude = amplitudeJS;
          //float start_level = start_levelJS;
          //float frequency = frequencyJS;
          
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

          rValue = transition.r;
          //transformed *= transition.g;
          

          //float vAmplitude = (aRandom + sin(time * frequency * aRandom) + start_level) * transition.g * crest * overallAnimationLevel; 
          float vAmplitude = ((sin(time * frequency * aRandom) ) + aRandom + start_level) * transition.g;
          //float vAmplitude =  start_level * transition.g * crest * overallAnimationLevel;
          //float normalized_vAmplitude = clamp((vAmplitude - bottom_level) / (crest - bottom_level), 0.0, crest);
          float normalized_vAmplitude = clamp(vAmplitude, 0.0, crest);

          transformed.y += normalized_vAmplitude;

          vHeight = transformed.y;
          randomNumber = aRandom;
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
          varying float randomNumber;
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
          float normalized_vHeight = clamp((vHeight - minHeight) / (maxHeight - minHeight) , 0.05, 0.6);

          float color1 = diffuseColor.r;

          //diffuseColor.rgb = vec3(normalized_vHeight);

          diffuseColor.rgb = vec3(normalized_vHeight*randomNumber*0.773/2.0, normalized_vHeight*randomNumber*0.459/2.0, normalized_vHeight*randomNumber*0.969/2.0);
          // if (normalized_vHeight > 0.0) {
          //   //diffuseColor.rgb = vec3(1.0, 1.0, 1.0);
          //   diffuseColor.rgb = vec3(normalized_vHeight);
          // }
          // if(rValue > 0.0 ){
          //   //diffuseColor.rgb = vec3(0.36, 0.16, 0.30);
          //   diffuseColor.rgb = vec3(clamp(rValue/20.0, 0.0, 1.0));
          // }
          //diffuseColor.rgb = vec3(color1, diffuseColor.g, diffuseColor.b);
          `
          );
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

      // Animate the scene
      let time = 0;
      function animate() {
        stats.update();

        getAssetPositions();

        if (modelLoaded) {
          updatePosition(circlepath, cameraRef.current, positionAlongPathState);
          updatePosition(targetPath, targetObject, positionAlongPathState);
        }

        time += 0.01;
        //shaderMaterial.uniforms.time.value = time;
        timeUniform.value = time;

        spotLightParent.rotation.y += 0.01;
        controlsRef.current.update();

        TWEEN.update();

        //composer.render();
        rendererRef.current.setRenderTarget(fboRef.current);
        rendererRef.current.render(fboScene, fboCamera);

        //console.log(fbo);

        rendererRef.current.setRenderTarget(null);
        //if (uniforms != null) uniforms.uFBO.value = fboRef.current.texture;
        rendererRef.current.render(sceneRef.current, cameraRef.current);

        requestAnimationFrame(animate);
      }
      animate();
    }
  }

  useEffect(() => {
    let isMounted = true;

    setupFBO();
    setupScene();
  }, []);

  function showHideAssets() {
    const last = productAssetsRef.current.length - 1;
    if (
      productAssetAnchorRef.current.length > 0 &&
      progressJSRef.current.value >= 0.7 &&
      progressJSRef.current.value <= 0.8
    ) {
      console.log("hide show running : 1");
      productAssetsRef.current.forEach((object) => {
        sceneRef.current.remove(object);
      });
      sceneRef.current.add(productAssetsRef.current[0]);
    } else if (
      productAssetAnchorRef.current.length > 0 &&
      progressJSRef.current.value >= 0.8 &&
      progressJSRef.current.value <= 0.9
    ) {
      console.log("hide show running : 2");
      productAssetsRef.current.forEach((object) => {
        sceneRef.current.remove(object);
      });
      sceneRef.current.add(productAssetsRef.current[1]);
    } else if (
      productAssetAnchorRef.current.length > 0 &&
      progressJSRef.current.value >= 0.9
    ) {
      console.log(productAssetsRef.current);
      productAssetsRef.current.forEach((object) => {
        sceneRef.current.remove(object);
      });
      sceneRef.current.add(productAssetsRef.current[2]);
    } else {
      productAssetsRef.current.forEach((object) => {
        sceneRef.current.remove(object);
      });
    }
  }

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
    const animateLogo = gsap.timeline({});
    animateLogo.to(progressJSRef.current, {
      delay: 5,
      value: 0.2,
      duration: 10,
      onComplete: () => {
        logoAnimationCompletedRef.current = true;
        ScrollTrigger.create({
          trigger: ".container",
          start: "top",
          end: "10000px",
          pin: true,
          //markers: true,
          onUpdate: (self) => {
            progressJSRef.current.value = Math.max(
              0.2,
              Math.min(self.progress + 0.2, 1.0)
            ); //self.progress + 0.2;
            //showHideAssets();
          },
        });
      },
    });
  }, []);

  useEffect(() => {
    console.log(progressJSRef.current);
  }, [progressJSRef.current]);

  function onRotationChange(value) {
    rotationAngleJS.value = value;
  }
  function onScaleChange(value) {
    scaleJS.value = value;
  }
  function onProgressChange(value) {
    progressJSRef.current.value = value;
    showHideAssets();
  }

  return (
    <div className="container">
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
    </div>
  );
}
