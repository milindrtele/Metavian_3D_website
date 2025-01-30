import * as THREE from "three";
import { gsap } from "gsap";
import { CustomEase } from "gsap/CustomEase";

const aniSwquenceBeforeGetStarted = (
  aniTimeline,
  progressValue,
  camera,
  capsule_anchor,
  callback_1,
  callback_2
) => {
  const clock = new THREE.Clock();
  let previousTime = 0;
  var speed = 0.1;
  let delta = 0;
  let previousProgress = 0.0;
  let Currentprogress = 0.0;

  const cameraEndPosition = {
    x: -13,
    y: 4,
    z: -95,
  };
  const cameraTargetPosition = {
    x: 53.8746,
    y: 0.041356,
    z: -30.8687,
  };
  const capsuleEndPosition = {
    x: 26.844, // blender_x
    y: -5, // blender_z
    z: -83.10922187556825, // -1 * blender_y
  };
  const capsuleEndRotation = {
    x: (0 * Math.PI) / 180, // blender_x
    y: (0 * Math.PI) / 180, // blender_z
    z: (0 * Math.PI) / 180, // -1 * blender_y
  };

  const logoAnimationTimeline = gsap.timeline({});
  aniTimeline = gsap.timeline({});
  // const animateLogo = gsap.timeline({});
  // const animateCamera = gsap.timeline({});
  // const animateCapsule = gsap.timeline({});
  const animateLogo = logoAnimationTimeline.to(progressValue, {
    delay: 2,
    value: 0.2,
    duration: 20,
  });
  const animateCamera = aniTimeline.to(camera.position, {
    ...cameraEndPosition,
    // x: 21.8609, // blender_x
    // y: 0.041356, // blender_z
    // z: -67.348, // -1 * blender_y
    delay: 5,
    duration: 5,
    ease: CustomEase.create(
      "custom",
      "M0,0 C0.106,0 0.195,0.008 0.288,0.063 0.513,0.198 0.589,0.618 0.714,0.829 0.797,0.97 0.893,1 1,1 "
    ),
    onStart: () => {
      let target = { x: 0, y: 0, z: 0 };
      gsap.to(target, {
        ...cameraTargetPosition,
        duration: 5,
        ease: CustomEase.create(
          "custom",
          "M0,0 C0.106,0 0.195,0.008 0.288,0.063 0.513,0.198 0.589,0.618 0.714,0.829 0.797,0.97 0.893,1 1,1 "
        ),
        onUpdate: () => {
          camera.lookAt(target.x, target.y, target.z);
        },
      });
      gsap.to(camera, {
        fov: 50,
        duration: 5,
        onUpdate: () => {
          camera.updateProjectionMatrix();
        },
      });
    },
    onComplete: () => {},
  });
  const animateCapsule = aniTimeline.to(capsule_anchor.position, {
    ...capsuleEndPosition,
    // delay: 10,
    duration: 4,
    ease: CustomEase.create(
      "custom",
      "M0,0 C0.106,0 0.195,0.008 0.288,0.063 0.513,0.198 0.589,0.618 0.714,0.829 0.797,0.97 0.893,1 1,1 "
    ),
    onStart: () => {
      // let target = { x: 0, y: 0, z: 0 };
      // gsap.to(target, {
      //   x: camera.position.x,
      //   y: camera.position.y,
      //   z: camera.position.z,
      //   duration: 5,
      //   ease: CustomEase.create(
      //     "custom",
      //     "M0,0 C0.106,0 0.195,0.008 0.288,0.063 0.513,0.198 0.589,0.618 0.714,0.829 0.797,0.97 0.893,1 1,1 "
      //   ),
      //   onUpdate: () => {
      //     capsule_anchor.lookAt(target.x, target.y, target.z);
      //   },
      // });
      let targetRotation = { x: 0, y: (180 * Math.PI) / 180, z: 0 };
      gsap.to(targetRotation, {
        ...capsuleEndRotation,
        duration: 4,
        ease: CustomEase.create(
          "custom",
          "M0,0 C0.106,0 0.195,0.008 0.288,0.063 0.513,0.198 0.589,0.618 0.714,0.829 0.797,0.97 0.893,1 1,1 "
        ),
        onUpdate: () => {
          capsule_anchor.rotation.y = targetRotation.y;
        },
      });
    },
    onUpdate: () => {
      callback_1();
      //positionProjectionScreen();
    },
    onComplete: () => {
      callback_2();
      // setIsGetStartedVisible(true);
      // setInitialSequenceCompleted(true);
      // console.log(capsule_body.rotation.y);
    },
  });
};

export default aniSwquenceBeforeGetStarted;
