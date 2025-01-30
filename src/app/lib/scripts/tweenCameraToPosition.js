import * as THREE from "three";
import { gsap } from "gsap";

const tweenCameraToNewPositionAndRotation = (
  camera,
  controls,
  currentCameraTarget,
  cameraTarget,
  newPosition,
  newRotation
) => {
  // const tweenTarget = gsap.to(controls.target, {
  //   ...cameraTarget,
  //   duration: 1,
  //   onUpdate: () => {},
  // });
  return new Promise((resolve, reject) => {
    let animationCompletionArray = [];

    function addToAnimationArray() {
      animationCompletionArray.push(true);
    }

    function checkAllAnimationsCompleted() {
      if (newRotation == null) {
        if (animationCompletionArray.length == 2) {
          resolve();
        }
      } else {
        if (animationCompletionArray.length == 3) {
          resolve();
        }
      }
    }

    let target = { ...currentCameraTarget };
    gsap.to(target, {
      ...cameraTarget,
      duration: 1,
      onUpdate: () => {
        camera.lookAt(target.x, target.y, target.z);
      },
      onComlete: () => {
        addToAnimationArray();
        checkAllAnimationsCompleted();
      },
    });
    const tweenPosition = gsap.to(camera.position, {
      ...newPosition,
      duration: 1,
      onUpdate: () => {},
      onComlete: () => {
        addToAnimationArray();
        checkAllAnimationsCompleted();
      },
    });
    if (newRotation != null) {
      const tweenRotation = gsap.to(camera.rotation, {
        ...newRotation,
        duration: 1,
        onUpdate: () => {},
        onComlete: () => {
          addToAnimationArray();
          checkAllAnimationsCompleted();
        },
      });
    }
  });
};

export { tweenCameraToNewPositionAndRotation };
