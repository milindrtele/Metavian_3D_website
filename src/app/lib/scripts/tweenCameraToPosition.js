import * as THREE from "three";
import { gsap } from "gsap";

const tweenCameraToNewPositionAndRotation = (
  camera,
  controls,
  cameraTarget,
  newPosition,
  newRotation
) => {
  // const tweenTarget = gsap.to(controls.target, {
  //   ...cameraTarget,
  //   duration: 1,
  //   onUpdate: () => {},
  // });
  let target = { x: 0, y: 0, z: 0 };
  gsap.to(target, {
    ...cameraTarget,
    duration: 1,
    onUpdate: () => {
      camera.lookAt(target.x, target.y, target.z);
    },
  });
  const tweenPosition = gsap.to(camera.position, {
    ...newPosition,
    duration: 1,
    onUpdate: () => {},
  });
  if (newRotation != null) {
    const tweenRotation = gsap.to(camera.rotation, {
      ...newRotation,
      duration: 1,
      onUpdate: () => {},
    });
  }
};

export { tweenCameraToNewPositionAndRotation };
