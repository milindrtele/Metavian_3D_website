import * as THREE from "three";
import { gsap } from "gsap";

class camAnimator {
  constructor(camera, target) {
    this.camera = camera;
    this.target = target;
    this.onMouseMove = this.onMouseMove.bind(this);
    this.mousePos = {};
    this.rotationSpeed = 30;
    this.currentCamPos = null;
    this.currentCamTarget = null;
    // this.init();
  }

  init() {
    // if (this.currentCamPos == null) {
    //   this.currentCamPos = this.camera.position;
    // }
    window.addEventListener("mousemove", this.onMouseMove);
  }

  onMouseMove(event) {
    this.mousePos = {
      x: (event.clientX / window.innerWidth) * 2 - 1, // Normalize X to [-1, 1]
      y: -(event.clientY / window.innerHeight) * 2 + 1, // Normalize Y to [-1, 1]
    };

    this.camera.position.x =
      this.currentCamPos.x - this.mousePos.x * this.rotationSpeed;

    // console.log("x : " + this.currentCamPos.x);
    // this.camera.position.x = THREE.MathUtils.lerp(
    //   this.currentCamPos.x,
    //   this.currentCamPos.x + this.mousePos.x * this.rotationSpeed,
    //   //  this.mousePos.x * this.rotationSpeed - (2*this.camera.position.x),
    //   //Math.max(this.currentCamPos.x + this.mousePos.x * this.rotationSpeed + 2, this.camera.position.x),
    //   0.5
    // );
    this.camera.position.y = THREE.MathUtils.lerp(
      this.currentCamPos.y,
      Math.max(this.mousePos.y * this.rotationSpeed + 2, 2),
      0.5
    );

    //this.camera.lookAt({ x: 0, y: 0, z: 0 });
  }

  remove() {
    window.removeEventListener("mousemove", this.onMouseMove);
  }
}

export { camAnimator };
