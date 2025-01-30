import * as THREE from "three";

class teamHandler {
  constructor(scene, loader) {
    this.scene = scene;
    this.loader = loader;

    this.load();
  }

  load() {
    // Load a glTF resource
    this.loader.load(
      // resource URL
      "/models/team_scene/cleaned_team.glb",
      // called when the resource is loaded
      (gltf) => {
        // Use arrow function here
        console.log(gltf.scene);
        this.teamScene = gltf.scene; // Now 'this' correctly refers to the class instance

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
    if (this.teamScene) {
      this.scene.add(this.teamScene);
    } else {
      console.log("teamScene is not loaded yet.");
    }
  }

  removeFromScene() {
    if (this.teamScene) {
      this.scene.remove(this.teamScene);
    } else {
      console.log("teamScene is not loaded yet.");
    }
  }
}

export { teamHandler };
