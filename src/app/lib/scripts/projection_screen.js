import * as THREE from "three";
import {
  CSS3DRenderer,
  CSS3DObject,
} from "three/addons/renderers/CSS3DRenderer.js";

let projection_element = null;
let projected_screen = null;
let iframe = null;
// let hideiFrame = null;
// let showiFrame = null;

export function setUpProjectionScreen(anchor, cssScene) {
  // Set up CSS3D objects and add them to cssScene
  projection_element = document.createElement("div");
  projection_element.style.width = "720px";
  projection_element.style.height = "405px";
  projection_element.style.pointerEvents = "none";
  projection_element.style.position = "fixed";
  projection_element.style.zIndex = 1;

  const id = "N7FkXKMPRDY";
  iframe = document.createElement("iframe");
  iframe.style.width = "720px";
  iframe.style.height = "405px";
  iframe.style.border = "0px";
  // iframe.style.borderRadius = "20px";
  iframe.src = ["https://www.youtube.com/embed/", id, "?rel=0&autoplay=1"].join(
    ""
  );
  //iframe.src = "https://metavian.tech/";
  iframe.style.opacity = 1;
  iframe.allowFullscreen = true;
  projection_element.appendChild(iframe);

  projection_element.style.pointerEvents = "none";
  //iframe.style.display = "none";
  //iframe.style.pointerEvents = "none";

  const css3dObject = new CSS3DObject(projection_element);
  //   css3dObject.position.set(
  //     anchor.position.x,
  //     anchor.position.y,
  //     anchor.position.z
  //   ); //7.0819, 3.6976, -73.529
  css3dObject.rotation.set(0, (Math.PI / 180) * 214.48, 0);
  css3dObject.scale.set(0.03, 0.03, 0.03);
  cssScene.add(css3dObject);
  projected_screen = css3dObject;
  projected_screen.element.style.opacity = 0;
}

export function hideiFrame() {
  iframe.style.display = "none";
}
export function showiFrame() {
  iframe.style.display = "block";
}

export { projected_screen, iframe };
