import { useEffect, useRef, useContext } from "react";
import * as THREE from "three";
import { loadingContext } from "../contexts/loadingContext.jsx";
import styles from "./productInfo.module.css";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { RGBELoader } from "three/addons/loaders/RGBELoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import {
  CSS2DRenderer,
  CSS2DObject,
} from "three/examples/jsm/renderers/CSS2DRenderer.js";
// import {
//   CSS3DRenderer,
//   CSS3DObject,
// } from "three/addons/renderers/CSS3DRenderer.js";
import { gsap } from "gsap";

import Hotspot from "../../lib/scripts/hotspot.js";
// import Hotspot3D from "../../lib/scripts/hotspot3D.js";
import Loading from "../loading/loading.jsx";
//stars
import Stars from "../../lib/scripts/stars.js";

// Caching product and hotspot data to avoid redundant fetches
let productsDataCache = null;
let hotspotDataCache = null;

let hotspotsArray = [];
// let hotspots3DArray = [];

async function fetchProductData(url) {
  if (!productsDataCache) {
    try {
      const response = await fetch(url);
      if (!response.ok)
        throw new Error(`HTTP error! Status: ${response.status}`);
      productsDataCache = await response.json();
    } catch (error) {
      console.error("Failed to fetch product data:", error);
    }
  }
  return productsDataCache;
}

async function fetchHotspotData(url) {
  if (!hotspotDataCache) {
    try {
      const response = await fetch(url);
      if (!response.ok)
        throw new Error(`HTTP error! Status: ${response.status}`);
      hotspotDataCache = await response.json();
    } catch (error) {
      console.error("Failed to fetch hotspot data:", error);
    }
  }
  return hotspotDataCache;
}

export default function ProductInfo({ product, closeClicked, css2DScene }) {
  const { loadedPercentage, setLoadedPercentage } = useContext(loadingContext);
  const productCanvasRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const animationFrameId = useRef(null);
  const css2DSceneRef = useRef(null);
  const css2dRendererRef = useRef(null);
  // const css3DSceneRef = useRef(null);
  // const css3dRendererRef = useRef(null);
  const spotLightRef = useRef(null);
  const product_info_containerRef = useRef(null);
  const main_rotorRef = useRef(null);
  const tail_rotorRef = useRef(null);
  const starsRef = useRef(null); //stars

  function forVirtualProduction(scene) {
    // Create a video element
    const video = document.createElement("video");

    // Set attributes for the video
    video.setAttribute("controls", ""); // Adds play/pause, volume, etc.
    video.setAttribute("width", "640"); // Set the width of the video
    video.setAttribute("height", "360"); // Set the height of the video
    video.setAttribute("autoplay", "");
    video.setAttribute("loop", "");

    // Create a source element for the video file
    const source = document.createElement("source");
    source.setAttribute("src", "/videos/VirtualProduction_FinalVideo.mp4"); // Path to your video
    source.setAttribute("type", "video/mp4"); // Video format (could be 'video/webm' or 'video/ogg' depending on your video type)

    // Append the source to the video element
    video.appendChild(source);
    product_info_containerRef.current.appendChild(video);

    const video_screen = scene.getObjectByName("video_screen");
    main_rotorRef.current = scene.getObjectByName("main_rotor");
    tail_rotorRef.current = scene.getObjectByName("tail_rotor");

    const video_texture = new THREE.VideoTexture(video);
    video_texture.flipY = false;

    video_screen.material.map = video_texture;
  }

  useEffect(() => {
    console.log(product);
    const manager = new THREE.LoadingManager();
    manager.onProgress = function (url, itemsLoaded, itemsTotal) {
      setLoadedPercentage((itemsLoaded / itemsTotal) * 100);
    };
    manager.onLoad = function () {
      console.log("Loading complete!");
      setLoadedPercentage(100);
    };

    const gltfLoader = new GLTFLoader(manager);
    const rgbeLoader = new RGBELoader();

    const canvas = productCanvasRef.current;
    if (!canvas) return;

    // Renderer setup
    rendererRef.current = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
    });
    rendererRef.current.setSize(canvas.clientWidth, canvas.clientHeight);
    rendererRef.current.toneMapping = THREE.ACESFilmicToneMapping;
    rendererRef.current.shadowMap.enabled = true;
    rendererRef.current.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap

    //css2Drenderer
    css2dRendererRef.current = new CSS2DRenderer();
    css2dRendererRef.current.setSize(canvas.clientWidth, canvas.clientHeight);
    // css2dRendererRef.current.domElement.style.position = "absolute";
    css2dRendererRef.current.domElement.style.top = 0;
    css2dRendererRef.current.domElement.style.pointerEvents = "none";
    css2dRendererRef.current.domElement.style.position = "fixed";
    document.body.appendChild(css2dRendererRef.current.domElement);

    // //css3Drenderer
    // css3dRendererRef.current = new CSS3DRenderer();
    // css3dRendererRef.current.setSize(canvas.clientWidth, canvas.clientHeight);
    // // css3dRendererRef.current.domElement.style.position = "absolute";
    // css3dRendererRef.current.domElement.style.top = 0;
    // css3dRendererRef.current.domElement.style.pointerEvents = "none";
    // css3dRendererRef.current.domElement.style.position = "fixed";
    // document.body.appendChild(css3dRendererRef.current.domElement);

    // Scene and camera setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    //css2Dscene
    css2DSceneRef.current = new THREE.Scene();
    // //css3Dscene
    // css3DSceneRef.current = new THREE.Scene();

    cameraRef.current = new THREE.PerspectiveCamera(
      50,
      canvas.clientWidth / canvas.clientHeight,
      0.1,
      1000
    );
    cameraRef.current.position.set(130, 130, 130);

    // OrbitControls
    controlsRef.current = new OrbitControls(
      cameraRef.current,
      rendererRef.current.domElement
    );
    controlsRef.current.enabled = false;

    //Directional light
    // const light = new THREE.DirectionalLight(0xffffff, 1);
    // light.position.set(10, 10, 0); //default; light shining from top
    // light.castShadow = true; // default false
    // scene.add(light);

    //Set up shadow properties for the light
    // light.shadow.mapSize.width = 512; // default
    // light.shadow.mapSize.height = 512; // default
    // light.shadow.camera.near = 0.5; // default
    // light.shadow.camera.far = 500; // default

    spotLightRef.current = new THREE.SpotLight(0xffffff, 3000);
    spotLightRef.current.position.set(10, 20, 10);
    spotLightRef.current.angle = Math.PI / 4;
    spotLightRef.current.penumbra = 1;
    spotLightRef.current.decay = 2;
    spotLightRef.current.distance = 40;

    spotLightRef.current.castShadow = true;
    spotLightRef.current.shadow.mapSize.width = 512;
    spotLightRef.current.shadow.mapSize.height = 512;
    spotLightRef.current.shadow.camera.near = 0.1;
    spotLightRef.current.shadow.camera.far = 50;
    spotLightRef.current.shadow.bias = -0.0001;

    scene.add(spotLightRef.current);
    // const spotLightHelper = new THREE.SpotLightHelper(spotLightRef.current);
    // scene.add(spotLightHelper);

    starsRef.current = new Stars(sceneRef.current, 5000, 750);

    // Load HDRI Environment
    rgbeLoader
      .setPath("models/capsule/capsule/")
      .load("brown_photostudio_01_1k.hdr", (texture) => {
        texture.mapping = THREE.EquirectangularReflectionMapping;
        scene.environment = texture;
        scene.environmentIntensity = 0.25;
      });

    // Load Product Model
    fetchProductData("/json/productInfo.json").then((data) => {
      const productData = data?.find(
        (item) => item.productModelName === product
      );
      if (productData) {
        gltfLoader.load(
          productData.modelUrl,
          (gltf) => {
            scene.add(gltf.scene);
            gltf.scene.traverse((child) => {
              if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
              }
            });
            if (product == "virtual_production")
              forVirtualProduction(gltf.scene);

            fetchHotspotData("/json/hotspotData.json").then((data) => {
              const productData = data?.find(
                (item) => item.productModelName === product
              );
              if (productData != null) {
                //css2DHotspot
                const hotspotArray = productData.hotspotArray;
                if (hotspotArray) {
                  hotspotArray.forEach((hotspot) => {
                    const hotspotInstance = new Hotspot(
                      "secondary",
                      css2DSceneRef.current,
                      hotspot.hotSpotPos,
                      hotspot.distanceFormCam,
                      hotspot.childHtmlUrl,
                      hotspot.title,
                      hotspot.subTitle,
                      hotspot.videoID,
                      hotspot.webURL,
                      cameraRef.current,
                      null, //productViewerCallback,
                      false, //productPageVisible
                      hotspot.iconURL
                    );
                    hotspotInstance.addToScene();
                    hotspotsArray.push(hotspotInstance);

                    // const hotspotInstance3D = new Hotspot3D(
                    //   "secondary",
                    //   css3DSceneRef.current,
                    //   hotspot.hotSpotPos,
                    //   hotspot.distanceFormCam,
                    //   hotspot.childHtmlUrl,
                    //   hotspot.title,
                    //   hotspot.subTitle,
                    //   hotspot.videoID,
                    //   hotspot.webURL,
                    //   cameraRef.current,
                    //   null, //productViewerCallback,
                    //   false //productPageVisible
                    // );
                    // hotspotInstance3D.addToScene();
                    // hotspots3DArray.push(hotspotInstance3D);
                  });
                }
              }
            });
          },
          (xhr) => {
            //console.log(xhr);
            //setLoadedPercentage((xhr.loaded / xhr.total) * 100);
            //console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
          },
          (error) => console.error("Error loading model:", error)
        );
      }
    });

    const animateRotors = () => {
      if (main_rotorRef.current != null && tail_rotorRef.current != null) {
        main_rotorRef.current.rotation.z -= 0.3;
        tail_rotorRef.current.rotation.y -= 0.3;
      }
    };

    // Animation loop
    let time = 0;
    const animate = () => {
      if (starsRef.current) {
        starsRef.current.material.uniforms.time.value = time;
      }
      animateRotors();
      controlsRef.current.update();
      rendererRef.current.render(scene, cameraRef.current);
      css2dRendererRef.current.render(css2DSceneRef.current, cameraRef.current);
      // css3dRendererRef.current.render(css3DSceneRef.current, cameraRef.current);
      time += 0.01;
      animationFrameId.current = requestAnimationFrame(animate);
    };
    animate();

    // Cleanup on unmount
    return () => {
      cancelAnimationFrame(animationFrameId.current);
      controlsRef.current.dispose();
      rendererRef.current.dispose();

      scene.traverse((object) => {
        if (object.isMesh) {
          object.geometry.dispose();
          object.material.dispose();
        }
      });

      hotspotsArray.forEach((hotspot) => {
        hotspot.removeFromScene();
      });

      starsRef.current.dispose();

      // hotspots3DArray.forEach((hotspot3D) => {
      //   hotspot3D.removeFromScene();
      // });

      sceneRef.current = null;
      css2DSceneRef.current = null;
      // css3DSceneRef.current = null;
      spotLightRef.current = null;
      main_rotorRef.current = null;
      tail_rotorRef.current = null;

      if (css2dRendererRef.current) {
        css2dRendererRef.current.domElement.remove();
        css2dRendererRef.current = null;
      }
      // if (css3dRendererRef.current) {
      //   css3dRendererRef.current.domElement.remove();
      //   css3dRendererRef.current = null;
      // }
      cameraRef.current = null;
      controlsRef.current = null;
      rendererRef.current = null;
      hotspotsArray = [];
      // hotspots3DArray = [];
    };
  }, [product]); // Reinitialize when `product` changes

  useEffect(() => {
    if (loadedPercentage === 100 && cameraRef.current) {
      let camStartPos = new THREE.Vector3(-50, 50, 50);
      let camEndPos = new THREE.Vector3(15, 10, 15);

      gsap.to(camStartPos, {
        x: camEndPos.x,
        y: camEndPos.y,
        z: camEndPos.z,
        duration: 1.5, // Reduced for quick testing
        ease: "power1.out", //"circ.out", //"elastic.out(2,1)", //, //"elastic.out(1, 0.3)", // //
        onStart: () => {
          controlsRef.current.enabled = false;
        },
        onUpdate: () => {
          if (cameraRef.current) {
            cameraRef.current.position.copy(camStartPos);
          }
        },
        onComplete: () => {
          controlsRef.current.enabled = true;
          controlsRef.current.enableDamping = true;
          controlsRef.current.dampingFactor = 0.2;
          controlsRef.current.enablePan = true;
          controlsRef.current.minPolarAngle = (Math.PI / 180) * 45;
          controlsRef.current.maxPolarAngle = (Math.PI / 180) * 84;
          // controlsRef.current.minAzimuthAngle = Math.PI * 0.25 * -1;
          // controlsRef.current.maxAzimuthAngle = Math.PI * 0.25;
          controlsRef.current.minDistance = 10;
          controlsRef.current.maxDistance = 100;
        },
      });
    }
  }, [loadedPercentage]);

  return (
    <div
      ref={product_info_containerRef}
      className={styles.product_info_container}
    >
      <canvas
        className={styles.product_3d_viewer}
        ref={productCanvasRef}
      ></canvas>
      <div className={styles.close_button_container} onClick={closeClicked}>
        <div className={styles.close_button}></div>
      </div>
      {/* <Loading /> */}
      {loadedPercentage < 100 ? <Loading /> : null}
    </div>
  );
}
