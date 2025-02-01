import { useEffect, useState, useRef } from "react";
import * as THREE from "three";
import styles from "./productInfo.module.css";

export default function ProductInfo(props) {
  const productCanvasRef = useRef(null);
  const productSceneRef = useRef(null);
  const productCamRef = useRef(null);

  const initScene = () => {
    props.renderer.canvas = productCanvasRef.current; //set product canvas as renderer canvas
    productSceneRef.current = new THREE.Scene(); //new scene
    productCamRef.current = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    ); //new camera

    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geometry, material);
    productSceneRef.current.add(cube);

    productCamRef.current.position.z = 5;

    function animate() {
      props.renderer.render(productSceneRef.current, productCamRef.current);
    }
    props.renderer.setAnimationLoop(animate);
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
      <div className={[styles.product_info]}></div>
    </div>
  );
}
