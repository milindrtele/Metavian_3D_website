import * as THREE from "three";
import { gsap } from "gsap";

const animateCapsuleRotation = (leg, capsule_anchor, projection_object) => {
  function rotate_Capsule(angle) {
    let capsuleRotationAndProjectionTimeline = gsap.timeline({});
    const currentAngle = capsule_anchor.rotation;
    const projection_scale_down = capsuleRotationAndProjectionTimeline.to(
      projection_object.scale,
      {
        x: 0,
        y: 0,
        z: 0,
        duration: 0.3,
        onUpdate: () => {},
      }
    );
    const capsuleRotation = capsuleRotationAndProjectionTimeline.to(
      currentAngle,
      {
        y: (angle * Math.PI) / 180,
        duration: 2,
        onUpdate: () => {},
      }
    );
    const projection_scale_up = capsuleRotationAndProjectionTimeline.to(
      projection_object.scale,
      {
        x: 1,
        y: 1,
        z: 1,
        duration: 0.3,
        onUpdate: () => {},
      }
    );

    //capsule_anchor.rotation.y = (Math.PI / 180) * currentAngle.y;
  }

  function checkLeg() {
    switch (leg.name) {
      case "leg_01_1":
        rotate_Capsule(60);
        break;
      case "leg_02_1":
        rotate_Capsule(120);
        break;
      case "leg_03_1":
        rotate_Capsule(180);
        break;
      case "leg_04_1":
        rotate_Capsule(240);
        break;
      case "leg_05_1":
        rotate_Capsule(300);
        break;
      case "leg_06_1":
        rotate_Capsule(360);
        break;
      default:
        console.warn("Unknown object clicked");
    }
  }
  function animateProjection() {}

  checkLeg();
};

export { animateCapsuleRotation };
