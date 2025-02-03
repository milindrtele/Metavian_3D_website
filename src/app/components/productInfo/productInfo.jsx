import { useEffect, useState, useRef } from "react";
import * as THREE from "three";
import styles from "./productInfo.module.css";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { RGBELoader } from "three/addons/loaders/RGBELoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

export default function ProductInfo(props) {
  const loader = new GLTFLoader();
  const productCanvasRef = useRef(null);
  const productRendererRef = useRef(null);
  const productSceneRef = useRef(null);
  const productCamRef = useRef(null);
  const productOrbitControlsRef = useRef(null);

  function loadHDRI() {
    return new Promise((resolve, reject) => {
      new RGBELoader()
        .setPath("models/capsule/capsule/")
        .load("brown_photostudio_01_1k.hdr", function (texture) {
          const hdrImage = texture;
          hdrImage.mapping = THREE.EquirectangularReflectionMapping;
          //productSceneRef.current.background = hdrImage;
          productSceneRef.current.environment = hdrImage;
          resolve();
        });
    });
  }

  const loadTheProductModel = (url) => {
    loader.load(
      url,
      (gltf) => {
        productSceneRef.current.add(gltf.scene);
        console.log(productSceneRef.current);
      },
      undefined,
      undefined
    );
  };

  const initScene = () => {
    // props.renderer.canvas = productCanvasRef.current; //set product canvas as renderer canvas
    productRendererRef.current = new THREE.WebGLRenderer({
      canvas: productCanvasRef.current,
      antialias: true,
      alpha: true,
    });
    productRendererRef.current.setSize(
      productCanvasRef.current.clientWidth,
      productCanvasRef.current.clientHeight
    );
    productSceneRef.current = new THREE.Scene(); //new scene
    productCamRef.current = new THREE.PerspectiveCamera(
      75,
      productCanvasRef.current.clientWidth /
        productCanvasRef.current.clientHeight,
      0.1,
      1000
    ); //new camera

    productCamRef.current.position.set(15.0329, 12.5874, 16.7306);

    productOrbitControlsRef.current = new OrbitControls(
      productCamRef.current,
      productRendererRef.current.domElement
    );

    loadHDRI();

    loadTheProductModel(props.modelUrl); //load the model

    function animate() {
      productOrbitControlsRef.current.update();
      productRendererRef.current.render(
        productSceneRef.current,
        productCamRef.current
      );
    }
    productRendererRef.current.setAnimationLoop(animate);
  };

  useEffect(() => {
    if (props.renderer != null) initScene();
  }, [props.renderer]);

  return (
    <div className={[styles.product_info_container]}>
      <canvas
        className={[styles.product_3d_viewer]}
        ref={productCanvasRef}
      ></canvas>
      <div className={[styles.product_info]}>
        <div className={[styles.product_info_parent]}>
          <div className={[styles.call_to_action_buttons]}>
            <div className={[styles.button, styles.button_1].join(" ")}></div>
            <div className={[styles.button, styles.button_2].join(" ")}></div>
          </div>
          <div className={[styles.title]}>
            <div className={[styles.title_a]}>
              <p>Car Configurator</p>
            </div>
            <div className={[styles.title_b]}>
              <p>Integer eget ante lacinia, dapibus mi sed, hendrerit sem.</p>
            </div>
          </div>
          <div className={[styles.key_features]}>
            <div className={[styles.key_feature_title]}>
              <p>Key Features</p>
            </div>
            <div className={[styles.key_feature_text_container]}>
              <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
              <p>Praesent iaculis nunc eu varius pharetra.</p>
              <p>
                Nulla quis lacus eget tellus fringilla congue id sit amet mi.
              </p>
              <p>Mauris mollis lectus vitae consectetur congue.</p>
            </div>
          </div>
          <div className={[styles.media]}>
            <div className={[styles.media_title]}>
              <p>Media</p>
            </div>
            <div className={[styles.media_image_container]}></div>
          </div>
          <div className={[styles.footer]}></div>
        </div>
      </div>
    </div>
  );
}
