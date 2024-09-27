import * as THREE from "three";
import {
  CSS3DRenderer,
  CSS3DObject,
} from "three/addons/renderers/CSS3DRenderer.js";

let projected_screen = null;

export function setUpProjectionScreen(anchor, cssScene) {
  // Set up CSS3D objects and add them to cssScene
  const element = document.createElement("div");
  element.style.width = "720px";
  element.style.height = "405px";
  element.style.pointerEvents = "none";
  element.style.position = "fixed";

  const id = "N7FkXKMPRDY";
  const iframe = document.createElement("iframe");
  iframe.style.width = "720px";
  iframe.style.height = "405px";
  iframe.style.border = "0px";
  iframe.style.borderRadius = "20px";
  iframe.src = ["https://www.youtube.com/embed/", id, "?rel=0"].join("");
  //iframe.src = "https://metavian.tech/";
  iframe.style.opacity = 1;
  element.appendChild(iframe);

  element.style.pointerEvents = "none";
  //iframe.style.pointerEvents = "none";

  const css3dObject = new CSS3DObject(element);
  //   css3dObject.position.set(
  //     anchor.position.x,
  //     anchor.position.y,
  //     anchor.position.z
  //   ); //7.0819, 3.6976, -73.529
  css3dObject.rotation.set(0, (Math.PI / 180) * 214.48, 0);
  css3dObject.scale.set(0.022, 0.022, 0.022);
  cssScene.add(css3dObject);
  projected_screen = css3dObject;
}

export { projected_screen };
