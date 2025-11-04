import * as THREE from "three";
import { gsap } from "gsap";

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
      "/models/team_scene/cleaned_team_v03.glb",
      // called when the resource is loaded
      (gltf) => {
        // Use arrow function here
        console.log(gltf.scene);
        this.teamScene = gltf.scene;

        gltf.animations; // Array<THREE.AnimationClip>
        gltf.scene; // THREE.Group
        gltf.scenes; // Array<THREE.Group>
        gltf.cameras; // Array<THREE.Camera>
        gltf.asset; // Object

        this.teamFrameParent = this.teamScene.getObjectByName("frames_parent");

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

  scaleTextureUp(object) {
    object.material.map.wrapS = THREE.RepeatWrapping;
    object.material.map.wrapT = THREE.RepeatWrapping;
    let scale = {
      x: object.material.map.repeat.x,
      y: object.material.map.repeat.y,
    };
    let targetScale = { x: 2, y: 2 };
    gsap.to(scale, {
      ...targetScale,
      duration: 1,
      onUpdate: () => {
        object.material.map.repeat.set(scale.x, scale.y);
      },
      onComplete: () => {},
    });
  }

  scaleTextureDown(object) {
    object.material.map.wrapS = THREE.RepeatWrapping;
    object.material.map.wrapT = THREE.RepeatWrapping;
    let scale = {
      x: object.material.map.repeat.x,
      y: object.material.map.repeat.y,
    };
    let targetScale = { x: 1, y: 1 };
    gsap.to(scale, {
      ...targetScale,
      duration: 1,
      onUpdate: () => {
        object.material.map.repeat.set(scale.x, scale.y);
      },
      onComplete: () => {},
    });
  }
}

export { teamHandler };
