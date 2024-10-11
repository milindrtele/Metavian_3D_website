import * as THREE from "three";
import { gsap } from "gsap";

let current_leg = null;
let selected_leg = null;
let isAnimationCompleted = false;

const id1 = "N7FkXKMPRDY"; //meta realty
const id2 = "G0txUiqltrA"; //car configurator
const id3 = "qDvG6torRtQ"; //fashion ix
const id4 = "Y3GO4qQ-A9w"; //edulab
const id5 = "_-fzzRIuS0o"; //virtual mart
const id6 = ":OteEL5SwXgM"; //virtual museum

const animateCapsuleRotation = (
  leg,
  capsule_body,
  projection_object,
  projected_screen,
  iframe
) => {
  function animate_capsule(targetAngle, hide) {
    if (hide) {
      // if (!projection_object.visible) {
      //   projection_object.material.uniforms.offset.value.y = 1;
      //   projection_object.visible = true;
      // }
      const projection_object_offset_value =
        projection_object.material.uniforms.offset.value;
      const screen_element = projected_screen.element;

      const capsuleRotationAndProjectionTimeline = gsap.timeline({});

      // Get the current angle in degrees
      const currentAngleDegrees = (capsule_body.rotation.y * 180) / Math.PI;

      // Calculate the shortest rotation path (clockwise or counterclockwise)
      let angleDifference = targetAngle - currentAngleDegrees;
      angleDifference = ((angleDifference + 180) % 360) - 180; // Ensure the shortest direction is taken

      // Convert the target angle back to radians
      const targetRotation = currentAngleDegrees + angleDifference;
      const targetRotationRadians = (targetRotation * Math.PI) / 180;

      // GSAP animation steps
      capsuleRotationAndProjectionTimeline
        .to(screen_element.style, {
          opacity: 0,
          duration: 0.5,
          ease: "bounce.out",
        })
        .to(projection_object_offset_value, {
          x: 0,
          y: 1,
          duration: 0.3,
          onUpdate: () => {},
        })
        .to(capsule_body.rotation, {
          y: targetRotationRadians,
          duration: 2,
          onUpdate: () => {},
          onComplete: () => {
            isAnimationCompleted = true;
          },
        });
    } else {
      if (!projection_object.visible) {
        projection_object.material.uniforms.offset.value.y = 1;
        projection_object.visible = true;
      }
      const projection_object_offset_value =
        projection_object.material.uniforms.offset.value;
      const screen_element = projected_screen.element;

      const capsuleRotationAndProjectionTimeline = gsap.timeline({});

      // Get the current angle in degrees
      const currentAngleDegrees = (capsule_body.rotation.y * 180) / Math.PI;

      // Calculate the shortest rotation path (clockwise or counterclockwise)
      let angleDifference = targetAngle - currentAngleDegrees;
      angleDifference = ((angleDifference + 180) % 360) - 180; // Ensure the shortest direction is taken

      // Convert the target angle back to radians
      const targetRotation = currentAngleDegrees + angleDifference;
      const targetRotationRadians = (targetRotation * Math.PI) / 180;

      // GSAP animation steps
      capsuleRotationAndProjectionTimeline
        .to(screen_element.style, {
          opacity: 0,
          duration: 0.5,
          ease: "bounce.out",
        })
        .to(projection_object_offset_value, {
          x: 0,
          y: 1,
          duration: 0.3,
          onUpdate: () => {},
        })
        .to(capsule_body.rotation, {
          y: targetRotationRadians,
          duration: 2,
          onUpdate: () => {},
        })
        .to(projection_object_offset_value, {
          x: 0,
          y: 0,
          duration: 0.3,
          onUpdate: () => {},
        })
        .to(screen_element.style, {
          opacity: 1,
          duration: 0.5,
          ease: "bounce.out",
          onComplete: () => {
            isAnimationCompleted = true;
          },
        });
    }
  }

  // function checkLeg() {
  //   console.log(current_leg + " " + selected_leg);
  //   selected_leg = leg.name;
  //   if (current_leg != selected_leg) {
  //     console.log(leg);
  //     const legs_parent = leg.parent.parent;
  //     legs_parent.children.forEach((leg_object) => {
  //       if (leg_object.children[0].name == selected_leg) {
  //         console.log("color changed");
  //         leg_object.children[0].material.color = new THREE.Color(0xff0000);
  //       } else {
  //         leg_object.children[0].material.color = new THREE.Color(0xffffff);
  //       }
  //     });
  //     current_leg = selected_leg;
  //     switch (leg.name) {
  //       case "leg_01_1":
  //         animate_capsule(0 + 30);
  //         break;
  //       case "leg_02_1":
  //         animate_capsule(60 + 30);
  //         break;
  //       case "leg_03_1":
  //         animate_capsule(120 + 30);
  //         break;
  //       case "leg_04_1":
  //         animate_capsule(180 + 30);
  //         break;
  //       case "leg_05_1":
  //         animate_capsule(240 + 30);
  //         break;
  //       case "leg_06_1":
  //         animate_capsule(300 + 30);
  //         break;
  //       default:
  //         console.warn("Unknown object clicked");
  //     }
  //   }
  // }

  function checkLeg() {
    if (leg == null) {
      iframe.src = null;
      animate_capsule(0, true);
    } else {
      console.log(current_leg + " " + selected_leg);
      selected_leg = leg.name;

      const original_material = leg.material;

      const selectedLegMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x1cc7aa,
        // transparent: true,
        // opacity: 0.5,
      });

      // Only proceed if the selected leg is different from the current leg
      if (current_leg !== selected_leg) {
        console.log(leg);
        const legs_parent = leg.parent.parent;

        legs_parent.children.forEach((leg_object) => {
          const legChild = leg_object.children[0];

          // Only update the color if it's not the selected leg
          if (legChild.name === selected_leg) {
            console.log("Selected leg, color changed to red.");
            legChild.material = selectedLegMaterial;
            // legChild.material.color = new THREE.Color(0x1cc7aa); // Change to red
            // legChild.material.opacity = 0.5;
          } else if (current_leg === legChild.name) {
            // Revert the color of the previously selected leg to white
            console.log("Previous leg, color changed to white.");
            //legChild.material.color = new THREE.Color(0xffffff); // Change to white
            legChild.material = original_material;
          }
        });

        current_leg = selected_leg;

        // Trigger the corresponding capsule animation based on the selected leg
        switch (leg.name) {
          case "leg_01_1":
            iframe.src = [
              // "https://cloud.protopie.io/p/604e1b159ff813ff97faa66a?ui=true&scaleToFit=true&enableHotspotHints=false&cursorType=arrow&mockup=true&bgColor=%23000000&bgImage=undefined&playSpeed=1",
              "https://www.youtube.com/embed/",
              //id1,
              //"?rel=0&autoplay=1",
            ].join("");
            animate_capsule(0 + 30, false);
            break;
          case "leg_02_1":
            iframe.src = [
              "https://www.youtube.com/embed/",
              id2,
              "?rel=0&autoplay=1",
            ].join("");
            animate_capsule(60 + 30, false);
            break;
          case "leg_03_1":
            iframe.src = [
              "https://www.youtube.com/embed/",
              id3,
              "?rel=0&autoplay=1",
            ].join("");
            animate_capsule(120 + 30, false);
            break;
          case "leg_04_1":
            iframe.src = [
              "https://www.youtube.com/embed/",
              id4,
              "?rel=0&autoplay=1",
            ].join("");
            animate_capsule(180 + 30, false);
            break;
          case "leg_05_1":
            iframe.src = [
              "https://www.youtube.com/embed/",
              id5,
              "?rel=0&autoplay=1",
            ].join("");
            animate_capsule(240 + 30, false);
            break;
          case "leg_06_1":
            iframe.src = [
              "https://www.youtube.com/embed/",
              id6,
              "?rel=0&autoplay=1",
            ].join("");
            animate_capsule(300 + 30, false);
            break;
          case "none":
            iframe.src = null;
            animate_capsule(0, true);
            break;
          default:
            console.warn("Unknown object clicked");
        }
      }
    }
  }

  checkLeg();

  return isAnimationCompleted;
};

export { animateCapsuleRotation };
