import * as THREE from "three";

class RaycasterHandler {
  constructor(scene, camera) {
    this.scene = scene;
    this.camera = camera;

    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();

    // Store callback functions that will be triggered on intersection
    this.clickCallbacks = [];
    this.hoverCallbacks = [];

    this.onMouseClick = this.onMouseClick.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);

    // Add event listeners for mouse click and mouse move (hover)
    window.addEventListener("click", this.onMouseClick);
    window.addEventListener("mousemove", this.onMouseMove);
  }

  // Method to dynamically add a click callback function
  addClickCallback(callback) {
    if (typeof callback === "function") {
      this.clickCallbacks.push(callback);
    }
  }

  // Method to dynamically add a hover callback function
  addHoverCallback(callback) {
    if (typeof callback === "function") {
      this.hoverCallbacks.push(callback);
    }
  }

  // Method to handle mouse clicks
  onMouseClick(event) {
    this.updatePointer(event);

    // Update the raycaster with the camera and pointer position
    this.raycaster.setFromCamera(this.pointer, this.camera);

    // Calculate objects intersecting the picking ray
    const intersects = this.raycaster.intersectObjects(this.scene.children);

    // Trigger each registered click callback function with the intersects array
    this.clickCallbacks.forEach((callback) => {
      callback(intersects);
    });
  }

  // Method to handle mouse hover (mousemove)
  onMouseMove(event) {
    this.updatePointer(event);

    // Update the raycaster with the camera and pointer position
    this.raycaster.setFromCamera(this.pointer, this.camera);

    // Calculate objects intersecting the picking ray
    const intersects = this.raycaster.intersectObjects(this.scene.children);

    // Trigger each registered hover callback function with the intersects array
    this.hoverCallbacks.forEach((callback) => {
      callback(intersects);
    });
  }

  // Update pointer position based on event coordinates
  updatePointer(event) {
    this.pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
  }

  // Optionally, add a method to remove the event listeners
  dispose() {
    window.removeEventListener("click", this.onMouseClick);
    window.removeEventListener("mousemove", this.onMouseMove);
  }
}

export { RaycasterHandler };
