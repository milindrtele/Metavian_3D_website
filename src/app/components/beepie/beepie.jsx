import { useEffect, useState, useRef } from "react";
import * as THREE from "three";
import styles from "./beepie.module.css";
import { gsap } from "gsap";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { RGBELoader } from "three/addons/loaders/RGBELoader.js";
import { div } from "three/examples/jsm/nodes/Nodes";
import { RectAreaLightUniformsLib } from "three/addons/lights/RectAreaLightUniformsLib.js";
import { NodeToyMaterial } from "@nodetoy/three-nodetoy";
import { data } from "../../lib/shaders/thrusters/thrusters.js";

import { Text } from "troika-three-text";

export default function Beepie(props) {
  const [displayText, setDisplayText] = useState("Hi I'm BeePie!");
  const [fullText, setFullText] = useState(
    "Hi I'm BeePie! Welcome to Metavian! 😀"
  ); // Long text for scrolling
  const indexRef = useRef(0); // To track the current index for the letters
  const myTextRef = useRef(null); // Ref for the troika Text instance
  const beepie_canvasRef = useRef(null);

  useEffect(() => {
    //const beepie_canvas = document.getElementById("beepie_canvas");
    let camera, scene, renderer, controls;

    const gltfloader = new GLTFLoader();

    let mixer;

    var tween;
    var deviceType;
    var maniquine;
    var parent;
    var display_screen;
    var mouseIn;

    var phone = null;
    const target = new THREE.Object3D();
    target.position.z = 2;

    const intersectionPoint = new THREE.Vector3();
    const planeNormal = new THREE.Vector3();
    const plane = new THREE.Plane();
    const mousePosition = new THREE.Vector2();
    const raycaster = new THREE.Raycaster();

    if (window.matchMedia("(any-hover: none)").matches) {
      console.log("no hover detected");
      deviceType = "touch";
    } else {
      deviceType = "non-touch";
    }

    function init() {
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(
        50,
        beepie_canvasRef.current.clientWidth /
          beepie_canvasRef.current.clientHeight,
        0.1,
        1000
      );

      const { width, height } =
        beepie_canvasRef.current.getBoundingClientRect();
      camera.aspect = width / height;

      camera.position.set(0, 1.55774, 6.35); // x: 2.102529764175415; y: 4.887204170227051; z : 8.62222

      renderer = new THREE.WebGLRenderer({
        canvas: beepie_canvasRef.current,
        antialias: true,
        alpha: true,
      });
      renderer.setClearColor(0x000000, 0);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.setSize(width, height);

      if (deviceType == "touch") {
        camera.position.set(0, 1.55774, 6.35);

        controls = new OrbitControls(camera, renderer.domElement);
        controls.target = new THREE.Vector3(0, 1.55774, 0); // 2.103, 4.887, 0.396
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
      }

      RectAreaLightUniformsLib.init();

      new RGBELoader().load(
        "vitruvian_man/odyssey_0_5K_6e3c37df-221e-49b9-8447-39a50559d19e.hdr",
        function (texture) {
          texture.mapping = THREE.EquirectangularReflectionMapping;
          scene.environment = texture;
        }
      );

      gltfloader.load("models/chat_bot/cleaned_beepie_animated.glb", (gltf) => {
        // models/chat_bot/cleaned_beepie.glb
        console.log(gltf);
        scene.add(gltf.scene);
        parent = gltf.scene.getObjectByName("parent");
        display_screen = gltf.scene.getObjectByName("display_glass");

        const model = gltf.scene;
        // model.position.set(1, 1, 0);
        // model.scale.set(0.01, 0.01, 0.01);
        // scene.add(model);

        mixer = new THREE.AnimationMixer(model);
        gltf.animations.forEach((animation) => {
          mixer.clipAction(animation).play();
        });

        // Create the Text instance
        const myText = new Text();
        display_screen.add(myText);
        myTextRef.current = myText;

        // Set properties to configure:
        myText.text = displayText;
        myText.fontSize = 0.2;
        myText.color = 0xffffff;
        myText.font = "/models/chat_bot/LLPIXEL3.ttf";

        // Position the text in front of the parent
        myText.position.set(0, 0.65, 1); // Adjust based on your scene

        // Anchor settings (center text horizontally, adjust vertically)
        myText.anchorX = "center"; // Center align the text along the x-axis
        myText.anchorY = "middle"; // Align vertically (middle)

        // Curve the text around the position
        myText.curveRadius = -1; // Positive radius will curve text around the parent

        // Update the rendering:
        myText.sync();

        // Animate the text position to create scrolling effect
        gsap.to(myText, {
          duration: 10, // Duration of the scroll animation
          x: -10, // Move the text off-screen to the left
          repeat: -1, // Infinite scrolling
          ease: "linear",
        });

        const thrusters_parent = gltf.scene.getObjectByName("thrusters_parent");

        console.log(thrusters_parent);

        const thrusters_material = new NodeToyMaterial({
          url: "https://draft.nodetoy.co/hFQpceTCaYikwftG",
          //data,
          //url: "https://draft.nodetoy.co/sQEShkUuOVzLqWhB",
          //url: "https://draft.nodetoy.co/3nu8OIh5jVem8uC4",
        });
        thrusters_material.side = THREE.DoubleSide;

        thrusters_parent.children.forEach((object) => {
          object.material = thrusters_material;
        });
      });

      const rectLight1 = new THREE.RectAreaLight(0xfcba03, 3, 20, 20);
      rectLight1.position.set(-5.257, 10.799, -5.653);
      rectLight1.rotation.set(
        (0 * Math.PI) / 180,
        (180 * Math.PI) / 180,
        (0 * Math.PI) / 180
      );
      scene.add(rectLight1);

      window.addEventListener("resize", () => {
        const { width, height } =
          beepie_canvasRef.current.getBoundingClientRect();
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
      });

      //plane.position.set(2.0238, 4.5, 7);

      plane.setFromNormalAndCoplanarPoint(
        new THREE.Vector3(0, 0, 1),
        new THREE.Vector3(0, 0, 3)
      );

      if (deviceType == "non-touch") {
        beepie_canvasRef.current.addEventListener("mousemove", (e) => {
          mouseIn = true;

          var offsets = beepie_canvasRef.current.getBoundingClientRect();
          mousePosition.x =
            ((e.clientX - offsets.left) / beepie_canvasRef.current.width) * 2 -
            1;
          mousePosition.y =
            -((e.clientY - offsets.top) / beepie_canvasRef.current.height) * 2 +
            1;

          raycaster.setFromCamera(mousePosition, camera);
          raycaster.ray.intersectPlane(plane, intersectionPoint);
          target.position.set(
            intersectionPoint.x,
            intersectionPoint.y,
            intersectionPoint.z
          );
        });
        beepie_canvasRef.current.addEventListener("mouseleave", () => {
          const cameraPos = camera.position;

          gsap.to(target.position, {
            duration: 0.75, // equivalent to 750ms
            x: camera.position.x,
            y: camera.position.y,
            z: camera.position.z,
            ease: "power2.inOut", // similar to Quadratic.InOut in TWEEN
            onUpdate: () => {
              if (parent != null) parent.lookAt(target.position);
            },
          });
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
      if (tween != null) tween.update(time);

      if (mixer) mixer.update(clock.getDelta());

      renderer.render(scene, camera);
    }

    init();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const maxLetters = 12; // Maximum number of letters to display
      const fullTextWithSpace = fullText + "    "; // Add 4 spaces at the end of the text
      const nextIndex = (indexRef.current + 1) % fullTextWithSpace.length; // Move to the next index
      let newDisplayText;

      // If we are close to the end of the text, wrap around to the beginning
      if (nextIndex + maxLetters > fullTextWithSpace.length) {
        const part1 = fullTextWithSpace.slice(nextIndex); // Get the remaining part at the end
        const part2 = fullTextWithSpace.slice(0, maxLetters - part1.length); // Wrap around to the beginning
        newDisplayText = part1 + part2; // Combine both parts
      } else {
        newDisplayText = fullTextWithSpace.slice(
          nextIndex,
          nextIndex + maxLetters
        );
      }

      setDisplayText(newDisplayText); // Update the state with the new text
      indexRef.current = nextIndex; // Update the index reference

      // Update the troika text instance if it's ready
      if (myTextRef.current) {
        myTextRef.current.text = newDisplayText;
        myTextRef.current.sync(); // Sync the text to update rendering
      }
    }, 100); // 0.1 second interval

    return () => clearInterval(interval); // Clear interval on unmount
  }, [fullText]);

  useEffect(() => {}, []);
  return (
    <div className={[styles.beepi_container].join(" ")}>
      <canvas
        ref={beepie_canvasRef}
        id="beepie_canvas"
        className={[styles.beepie_canvas].join(" ")}
      ></canvas>
    </div>
  );
}
