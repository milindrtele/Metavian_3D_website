import * as THREE from "three";
import { gsap } from "gsap";

const animateCapsuleRotation = (
  leg,
  capsule_body,
  projection_object,
  projected_screen
) => {
  function rotate_Capsule(angle) {
    let projection_object_offset_value =
      projection_object.material.uniforms.offset.value;

    let capsuleRotationAndProjectionTimeline = gsap.timeline({});
    const currentAngle = capsule_body.rotation;
    const screen_element = projected_screen.element;

    console.log((currentAngle.y * 180) / Math.PI);

    const projection_screen_fade_out = capsuleRotationAndProjectionTimeline.to(
      screen_element.style,
      {
        opacity: 0,
        duration: 0.5,
        ease: "bounce.out",
      }
    );
    const projection_scale_down = capsuleRotationAndProjectionTimeline.to(
      projection_object_offset_value,
      {
        x: 0,
        y: 1,
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
      projection_object_offset_value,
      {
        x: 0,
        y: 0,
        duration: 0.3,
        onUpdate: () => {},
      }
    );
    const projection_screen_fade_in = capsuleRotationAndProjectionTimeline.to(
      screen_element.style,
      {
        opacity: 1,
        duration: 0.5,
        ease: "bounce.out",
      }
    );

    //capsule_body.rotation.y = (Math.PI / 180) * currentAngle.y;
  }

  function checkLeg() {
    const currentAngle = capsule_body.rotation;
    switch (leg.name) {
      case "leg_01_1":
        rotate_Capsule(0);
        break;
      case "leg_02_1":
        rotate_Capsule(60);
        break;
      case "leg_03_1":
        rotate_Capsule(120);
        break;
      case "leg_04_1":
        rotate_Capsule(180);
        break;
      case "leg_05_1":
        rotate_Capsule(240);
        break;
      case "leg_06_1":
        rotate_Capsule(300);
        break;
      default:
        console.warn("Unknown object clicked");
    }
  }
  function animateProjection() {}

  checkLeg();
};

export { animateCapsuleRotation };
