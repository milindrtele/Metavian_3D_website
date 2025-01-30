import { gsap } from "gsap";
import { CustomEase } from "gsap/CustomEase";

const aniSequenceAfterGetStarted = (camera, callback) => {
  const cameraLeftPanEndPos = { x: 0.0, y: 4, z: -105.943 };
  const cameraForwardPanEndPos = {
    x: 26.844, // blender_x
    y: 4, // blender_z
    z: -83.10922187556825, // -1 * blender_y
  };

  let cameraTimeline = gsap.timeline();
  const cameraLeftPan = cameraTimeline.to(camera.position, {
    ...cameraLeftPanEndPos,
    duration: 1,
    ease: CustomEase.create(
      "custom",
      "M0,0 C0.106,0 0.195,0.008 0.288,0.063 0.513,0.198 0.589,0.618 0.714,0.829 0.797,0.97 0.893,1 1,1 "
    ),
  });
  // const cockpit_canopyDrop = cameraTimeline.to(cockpit_canopy.scale, {
  //   x: 1,
  //   y: 0,
  //   z: 1,
  //   duration: 1,
  //   ease: CustomEase.create(
  //     "custom",
  //     "M0,0 C0.106,0 0.195,0.008 0.288,0.063 0.513,0.198 0.589,0.618 0.714,0.829 0.797,0.97 0.893,1 1,1 "
  //   ),
  // });
  const cameraForwardPan = cameraTimeline.to(camera.position, {
    ...cameraForwardPanEndPos,
    duration: 1,
    delay: 1,
    ease: CustomEase.create(
      "custom",
      "M0,0 C0.106,0 0.195,0.008 0.288,0.063 0.513,0.198 0.589,0.618 0.714,0.829 0.797,0.97 0.893,1 1,1 "
    ),
    onStart: () => {
      // const cameraTargetPosition = {
      //   x: 53.8746,
      //   y: 0.041356,
      //   z: -30.8687,
      // };
      // let target = { x: 0, y: 0, z: 0 };
      // gsap.to(target, {
      //   ...cameraTargetPosition,
      //   duration: 5,
      //   ease: CustomEase.create(
      //     "custom",
      //     "M0,0 C0.106,0 0.195,0.008 0.288,0.063 0.513,0.198 0.589,0.618 0.714,0.829 0.797,0.97 0.893,1 1,1 "
      //   ),
      //   onUpdate: () => {
      //     cameraRef.current.lookAt(target.x, target.y, target.z);
      //   },
      //   onComplete: () => {
      //     controlsRef.current.enabled = true;
      //   },
      // });
    },
    onComplete: () => {
      callback();
    },
  });
};

export default aniSequenceAfterGetStarted;
