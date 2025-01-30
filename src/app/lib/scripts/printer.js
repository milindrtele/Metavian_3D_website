import * as THREE from "three";

class printerHandler {
  constructor(scene, loader) {
    this.scene = scene;
    this.loader = loader;

    this.load();
  }

  load() {
    // Load a glTF resource
    this.loader.load(
      // resource URL
      "/models/printer/printer.glb",
      // called when the resource is loaded
      (gltf) => {
        // Use arrow function here
        console.log(gltf.scene);
        this.printerScene = gltf.scene; // Now 'this' correctly refers to the class instance

        gltf.animations; // Array<THREE.AnimationClip>
        gltf.scene; // THREE.Group
        gltf.scenes; // Array<THREE.Group>
        gltf.cameras; // Array<THREE.Camera>
        gltf.asset; // Object

        //this.scene.add(this.teamScene);
      },
      undefined,
      // called when loading has errors
      function (error) {
        console.log("An error happened");
      }
    );
  }

  addToScene() {
    if (this.printerScene) {
      this.scene.add(this.printerScene);
    } else {
      console.log("printerScene is not loaded yet.");
    }
  }

  removeFromScene() {
    if (this.printerScene) {
      this.scene.remove(this.printerScene);
    } else {
      console.log("printerScene is not loaded yet.");
    }
  }
}

export { printerHandler };
