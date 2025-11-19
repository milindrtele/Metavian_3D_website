import * as THREE from "three";
import { gsap } from "gsap";

class teamHandler {
  constructor(scene, loader) {
    this.scene = scene;
    this.loader = loader;
    this.anchor_parent = null;
    this.animationCompleted = {};

    this.load();
  }

  async addUserDataToObject(scene) {
    scene.traverse((child) => {
      if (child.isMesh) {
        if (child.name.startsWith("box_")) {
          child.userData = { type: "hover_box" };
        }
      }
    });
  }

  load() {
    // Load a glTF resource
    this.loader.load(
      // resource URL
      "/models/team_scene/team scene with chair_04.glb", //cleaned_team_v03.glb
      // called when the resource is loaded
      (gltf) => {
        // Use arrow function here

        this.teamScene = gltf.scene;
        this.addUserDataToObject(this.teamScene);
        this.anchor_parent = this.teamScene.getObjectByName("anchors_parent");
        this.spotLightParent =
          this.teamScene.getObjectByName("spotlight_parent");
        this.spotLightParent.traverse((child) => {
          if (child.isLight) {
            child.penumbra = 1;
          }
        });
        this.anchor_parent.traverse((child) => {
          if (child.isMesh && child.name.startsWith("box_")) {
            this.animationCompleted[child.name] = false;
          }
        });

        console.log(this.teamScene);

        gltf.animations; // Array<THREE.AnimationClip>
        gltf.scene; // THREE.Group
        gltf.scenes; // Array<THREE.Group>
        gltf.cameras; // Array<THREE.Camera>
        gltf.asset; // Object

        //this.teamFrameParent = this.teamScene.getObjectByName("frames_parent");

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

  rotateChair(objectName) {
    if (this.animationCompleted[objectName]) return;
    console.log("rotateChair called for:", objectName);
    let chair = this.teamScene.getObjectByName(objectName);
    if (chair && !this.animationCompleted[objectName]) {
      gsap.to(chair.parent.rotation, {
        y: chair.rotation.y + Math.PI,
        duration: 2,
        ease: "power2.inOut",
        onStart: () => {
          this.animationCompleted[objectName] = true;
        },
        onComplete: () => {
          this.animationCompleted[objectName] = true;
        },
      });

      if (this.spotLightParent) {
        this.spotLightParent.traverse((child) => {
          console.log(
            "spotlight child name: ",
            child.name + `  ${objectName}_sl`
          );
          if (child.name === `${objectName}_sl`) {
            console.log("Animating spotlight for:", child.name);
            gsap.to(child, {
              intensity: 543.5141306588226,
              duration: 2,
              ease: "power2.in",
            });
          }
        });
      }

      //this.onRotateChairBack(objectName);
    }
  }

  onRotateChairBack(objectName) {
    this.anchor_parent.traverse((child) => {
      if (
        child.isMesh &&
        child.name.startsWith("box_") &&
        child.name != objectName &&
        this.animationCompleted[child.name]
      ) {
        gsap.to(child.parent.rotation, {
          y: 0,
          duration: 0.5,
          ease: "power2.inOut",
          onStart: () => {
            this.animationCompleted[child.name] = false;
          },
          onComplete: () => {
            this.animationCompleted[child.name] = true;
          },
        });
      }
    });
  }
}

export { teamHandler };
