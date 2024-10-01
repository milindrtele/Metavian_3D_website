import styles from "./startingMessage.module.css";
import { useRef, useState, useEffect } from "react";
import * as THREE from "three";
import Stats from "three/addons/libs/stats.module.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { RGBELoader } from "three/addons/loaders/RGBELoader.js";
import { gsap } from "gsap";
import { NodeToyMaterial } from "@nodetoy/three-nodetoy";

import { RectAreaLightHelper } from "three/addons/helpers/RectAreaLightHelper.js";
import { RectAreaLightUniformsLib } from "three/addons/lights/RectAreaLightUniformsLib.js";

export default function StartingMessage(props) {
  useEffect(() => {
    const vm_canvas = document.getElementById("vitruvian_man_canvas");
    let camera, scene, renderer, controls;

    const gltfloader = new GLTFLoader();

    var tween;
    var deviceType;
    var maniquine;
    var parent;
    var mouseIn;

    var phone = null;
    const target = new THREE.Object3D();
    target.position.z = 2;

    const intersectionPoint = new THREE.Vector3();
    const planeNormal = new THREE.Vector3();
    const plane = new THREE.Plane();
    const mousePosition = new THREE.Vector2();
    const raycaster = new THREE.Raycaster();

    const stats = Stats();
    document.body.appendChild(stats.dom);

    if (window.matchMedia("(any-hover: none)").matches) {
      console.log("no hover detected");
      deviceType = "touch";
    } else {
      deviceType = "non-touch";
    }

    function init() {
      // vm_canvas.width = window.innerWidth * 0.75;
      // vm_canvas.height = window.innerHeight * 0.5;

      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(
        50,
        vm_canvas.clientWidth / vm_canvas.clientHeight,
        0.1,
        1000
      );
      camera.position.set(2.102529764175415, 4, 6.35); // x: 2.102529764175415; y: 4.887204170227051; z : 8.62222

      renderer = new THREE.WebGLRenderer({
        canvas: vm_canvas,
        antialias: true,
        alpha: true,
      });
      renderer.setClearColor(0x000000, 0);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.setSize(vm_canvas.clientWidth, vm_canvas.clientHeight);

      if (deviceType == "touch") {
        camera.position.set(2.102529764175415, 3.5, 8.62222);

        controls = new OrbitControls(camera, renderer.domElement);
        controls.target = new THREE.Vector3(2.103, 3.2, 0.396); // 2.103, 4.887, 0.396
        controls.enablePan = false;
        // controls.maxDistance = 7;
        // controls.minDistance = 5;
        controls.enableZoom = false;
        controls.maxAzimuthAngle = (30 * Math.PI) / 180;
        controls.minAzimuthAngle = (-30 * Math.PI) / 180;
        controls.maxPolarAngle = (100 * Math.PI) / 180;
        controls.minPolarAngle = (60 * Math.PI) / 180;
        controls.enableDamping = true;
        controls.dampingFactor = 0.1;
        controls.update();
        console.log(controls);
      }

      RectAreaLightUniformsLib.init();

      new RGBELoader().load(
        "vitruvian_man/odyssey_0_5K_6e3c37df-221e-49b9-8447-39a50559d19e.hdr",
        function (texture) {
          texture.mapping = THREE.EquirectangularReflectionMapping;
          //scene.background = texture;
          //scene.background = new THREE.Color(0x919191);
          //scene.background = new THREE.Color(0xffffff);
          scene.environment = texture;
        }
      );

      gltfloader.load("vitruvian_man/vitruvian_man.glb", (gltf) => {
        scene.add(gltf.scene);
        parent = gltf.scene.getObjectByName("Empty001");
        const model = gltf.scene.getObjectByName("Vitruvian001");

        const hologram_material = new NodeToyMaterial({
          url: "https://draft.nodetoy.co/h4BbpCIAQkfAVrm3", //"https://draft.nodetoy.co/3nu8OIh5jVem8uC4",
        });

        // scene.traverse((child) => {
        //   if (child instanceof THREE.Mesh) {
        //     // apply custom material
        //     child.material = hologram_material;
        //   }
        // });

        model.material = hologram_material;

        // console.log(gltf.scene);
        // maniquine = gltf.scene.getObjectByName("body002");
        // phone = gltf.scene.getObjectByName("MobilePhone");

        // console.log(parent.position);
        // console.log(camera.position);

        // maniquine.material = new THREE.MeshStandardMaterial({
        //   color: "#4a4a4a",
        //   roughness: 0,
        //   metalness: 0,
        // });

        // const backgroundTexture = new THREE.TextureLoader().load(
        //   "./assets/360_F_252462257_DoikyDjIjHTM6jy9pfaLvRWu8iLrS0WW.jpg",
        //   (texture) => {
        //     maniquine.material.envMap = texture;
        //     scene.traverse(function (child) {
        //       console.log(child);
        //       if (child instanceof THREE.Mesh) {
        //         console.log(child);
        //         child.material.envMap = texture;
        //       }
        //     });
        //   }
        // );

        // backgroundTexture.mapping = THREE.EquirectangularReflectionMapping;
        // scene.background = backgroundTexture;
        // // scene.environment = backgroundTexture;
      });

      // const geoKnot = new THREE.TorusKnotGeometry(1.5, 0.5, 200, 16);
      // const matKnot = new THREE.MeshStandardMaterial({
      //   color: 0xffffff,
      //   roughness: 0,
      //   metalness: 0,
      // });
      // const meshKnot = new THREE.Mesh(geoKnot, matKnot);
      // meshKnot.position.set(0, 5, 0);
      // scene.add(meshKnot);

      const rectLight1 = new THREE.RectAreaLight(0xfcba03, 3, 20, 20);
      rectLight1.position.set(-5.257, 10.799, -5.653);
      rectLight1.rotation.set(
        (0 * Math.PI) / 180,
        (180 * Math.PI) / 180,
        (0 * Math.PI) / 180
      );
      scene.add(rectLight1);

      // const rectLight2 = new THREE.RectAreaLight(0xffffff, 1, 10, 10);
      // rectLight2.position.set(-2.264, 8.203, 4.13);
      // rectLight2.rotation.set(
      //   (-45 * Math.PI) / 180,
      //   (-45 * Math.PI) / 180,
      //   (0 * Math.PI) / 180
      // );
      // scene.add(rectLight2);

      // const rectLight3 = new THREE.RectAreaLight(0xffffff, 1, 10, 10);
      // rectLight3.position.set(6.654, 8.246, 3.679);
      // rectLight3.rotation.set(
      //   (-45 * Math.PI) / 180,
      //   (45 * Math.PI) / 180,
      //   (0 * Math.PI) / 180
      // );
      // scene.add(rectLight3);

      //scene.add(new RectAreaLightHelper(rectLight1));
      // scene.add(new RectAreaLightHelper(rectLight2));
      // scene.add(new RectAreaLightHelper(rectLight3));

      // rectLight1.visible = false;
      // rectLight2.visible = false;
      // rectLight3.visible = false;

      window.addEventListener("resize", () => {
        vm_canvas.width = window.innerWidth * 0.6;
        vm_canvas.height = window.innerHeight * 1;
        camera.aspect = vm_canvas.width / vm_canvas.height;
        renderer.setSize(vm_canvas.width, vm_canvas.height);
        camera.updateProjectionMatrix();
      });

      //plane.position.set(2.0238, 4.5, 7);

      plane.setFromNormalAndCoplanarPoint(
        new THREE.Vector3(0, 0, 1),
        new THREE.Vector3(0, 0, 3)
      );

      if (deviceType == "non-touch") {
        vm_canvas.addEventListener("mousemove", (e) => {
          mouseIn = true;
          // mousePosition.x =
          //   ((e.clientX - (window.innerWidth * 0.6) / 2) /
          //     window.innerWidth) *
          //     2 -
          //   window.innerWidth -
          //   window.innerWidth * 0.6;

          // console.log(
          //   ((e.clientX - window.innerWidth * 0.3) / vm_canvas.width) * 2 - 1
          // );
          var offsets = vm_canvas.getBoundingClientRect();
          mousePosition.x =
            ((e.clientX - offsets.left) / vm_canvas.width) * 2 - 1;
          mousePosition.y =
            -((e.clientY - offsets.top) / vm_canvas.height) * 2 + 1;
          //mousePosition.x = (e.clientX / window.innerWidth) * 2 - 1;
          //mousePosition.y = -(e.clientY / vm_canvas.height) * 2 + 1;
          //console.log(mousePosition.x);
          //planeNormal.copy(camera.position).normalize();
          //plane.setFromNormalAndCoplanarPoint(planeNormal, scene.position);

          raycaster.setFromCamera(mousePosition, camera);
          raycaster.ray.intersectPlane(plane, intersectionPoint);
          target.position.set(
            intersectionPoint.x,
            intersectionPoint.y,
            intersectionPoint.z
          );
        });
        vm_canvas.addEventListener("mouseleave", () => {
          // mouseIn = false;
          // console.log("mouse left");
          // parent.lookAt(camera.position);
          const cameraPos = camera.position;

          gsap.to(target.position, {
            duration: 0.75, // equivalent to 750ms
            x: camera.position.x,
            y: camera.position.y,
            z: camera.position.z,
            ease: "power2.inOut", // similar to Quadratic.InOut in TWEEN
            onUpdate: () => {
              console.log(target.position);
              if (parent != null) parent.lookAt(target.position);
            },
          });

          // tween = new TWEEN.Tween(target.position, false) // Create a new tween that modifies 'coords'.
          //   .to(
          //     {
          //       x: camera.position.x,
          //       y: camera.position.y,
          //       z: camera.position.z,
          //     },
          //     750
          //   ) // Move to (300, 200) in 0.5 second.
          //   .easing(TWEEN.Easing.Quadratic.InOut) // Use an easing function to make the animation smooth.
          //   .onUpdate(() => {
          //     console.log(target.position);
          //     if (parent != null) parent.lookAt(target.position);
          //   })
          //   .start(); // Start the tween immediately.
        });
      }

      renderer.setAnimationLoop(animate);
    }

    var clock = new THREE.Clock();
    function animate(time) {
      if (deviceType == "non-touch" && parent != null && mouseIn)
        parent.lookAt(target.position);
      if (deviceType == "touch") {
        controls.update(clock.getDelta());
      }
      stats.update();
      if (tween != null) tween.update(time);
      renderer.render(scene, camera);
    }

    init();
  }, []);

  return (
    <div
      onClick={() => {
        props.continue();
      }}
      className={styles.starting_message_page}
    >
      <canvas
        id="vitruvian_man_canvas"
        className={styles.vitruvian_man_canvas}
      ></canvas>
      <div className={styles.starting_message_container}>
        <p className={styles.starting_message_title}>DID YOU KNOW ?</p>
        <p className={styles.starting_message}>
          {/* Lorem Ipsum is simply dummy text of the printing and typesetting
          industry. Lorem Ipsum has been the industry's standard dummy text ever
          since the 1500s, when an unknown printer took a galley of type and
          scrambled it to make a type specimen book. */}
          Imagination is more important than knowledge. For knowledge is
          limited, whereas imagination embraces the entire world, stimulating
          progress, giving birth to evolution.
        </p>
        {/* <p className={styles.albert}>- Albert Einstein</p> */}
      </div>
    </div>
  );
}
