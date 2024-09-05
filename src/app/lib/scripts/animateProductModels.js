import * as THREE from "three";
import { gsap } from "gsap";

let isInAnimationStarted = false;
let isOutAnimationStarted = false;

function animateModelIn(scene, model, model_anchor) {
  const anchor = model.getObjectByName("anchor");
  return new Promise((resolve) => {
    isInAnimationStarted = true;
    let scale = { x: 0, y: 0, z: 0 };
    let rotation = { x: 0, y: 90, z: 0 };
    let targetScale = { x: 1, y: 1, z: 1 };
    let targetRotation = { x: 0, y: 180, z: 0 };
    anchor.scale.set(0, 0, 0);

    scene.add(model);

    gsap.to(scale, {
      ...targetScale,
      duration: 1,
      onUpdate: () => {
        anchor.scale.set(scale.x, scale.y, scale.z);
      },
      onComplete: () => {
        isInAnimationStarted = false;
      },
    });

    gsap.to(rotation, {
      ...targetRotation,
      duration: 1,
      onUpdate: () => {
        anchor.rotation.set(
          (rotation.x * Math.PI) / 180,
          (rotation.y * Math.PI) / 180,
          (rotation.z * Math.PI) / 180
        );
      },
      onComplete: () => {
        isInAnimationStarted = false;
        resolve();
      },
    });
  });
}

function animateModelOut(scene, model, model_anchor) {
  const anchor = model.getObjectByName("anchor");
  return new Promise((resolve) => {
    isOutAnimationStarted = true;
    let scale = { x: model.scale.x, y: model.scale.y, z: model.scale.z };
    let rotation = { x: 0, y: 90, z: 0 };
    let targetScale = { x: 0, y: 0, z: 0 };
    let targetRotation = { x: 0, y: 180, z: 0 };

    gsap.to(scale, {
      ...targetScale,
      duration: 1,
      onUpdate: () => {
        anchor.scale.set(scale.x, scale.y, scale.z);
      },
      onComplete: () => {
        isOutAnimationStarted = false;
        scene.remove(model);
        resolve();
      },
    });

    gsap.to(rotation, {
      ...targetRotation,
      duration: 1,
      onUpdate: () => {
        anchor.rotation.set(
          (rotation.x * Math.PI) / 180,
          (rotation.y * Math.PI) / 180,
          (rotation.z * Math.PI) / 180
        );
      },
      onComplete: () => {
        isOutAnimationStarted = false;
        scene.remove(model);
        resolve();
      },
    });
  });
}

export function animateProductModels(
  scene,
  projectModels,
  projectModelsAnchors,
  elapsedTime
) {
  if (elapsedTime > 1) {
    if (elapsedTime < 7) {
      projectModels.forEach((model, index) => {
        if (model.name == "car_configurator") {
          if (model.parent != scene && !isInAnimationStarted) {
            //
            animateModelIn(scene, model, projectModelsAnchors); //scene.add(model);
          }
        } else {
          if (model.parent == scene && !isOutAnimationStarted) {
            animateModelOut(scene, model, projectModelsAnchors); //scene.add(model);
          }
        }
      });
    } else if (elapsedTime < 18) {
      projectModels.forEach((model, index) => {
        if (model.name == "meta_realty") {
          if (model.parent != scene && !isInAnimationStarted)
            //
            animateModelIn(scene, model, projectModelsAnchors); //scene.remove(model);
        } else {
          if (model.parent == scene && !isOutAnimationStarted) {
            //
            animateModelOut(scene, model, projectModelsAnchors);
          }
        }
      });
    } else if (elapsedTime < 30) {
      projectModels.forEach((model, index) => {
        if (model.name == "virtual_production") {
          if (model.parent != scene && !isInAnimationStarted)
            //
            animateModelIn(scene, model, projectModelsAnchors); //scene.add(model); //scene.add(model);
        } else {
          if (model.parent == scene && !isOutAnimationStarted) {
            //
            animateModelOut(scene, model, projectModelsAnchors); //scene.add(model);
          }
        }
      });
    } else if (elapsedTime < 40) {
      projectModels.forEach((model, index) => {
        if (model.name == "edulab_v1") {
          if (model.parent != scene && !isInAnimationStarted)
            //
            animateModelIn(scene, model, projectModelsAnchors); //scene.remove(model);
        } else {
          if (model.parent == scene && !isOutAnimationStarted) {
            //
            animateModelOut(scene, model, projectModelsAnchors); //scene.add(model);
          }
        }
      });
    } else if (elapsedTime < 50) {
      projectModels.forEach((model, index) => {
        if (model.name == "fashion_ix") {
          if (model.parent != scene && !isInAnimationStarted)
            //
            animateModelIn(scene, model, projectModelsAnchors); //scene.remove(model);
        } else {
          if (model.parent == scene && !isOutAnimationStarted) {
            //
            animateModelOut(scene, model, projectModelsAnchors); //scene.add(model);
          }
        }
      });
    } else if (elapsedTime < 62) {
      projectModels.forEach((model, index) => {
        if (model.name == "virtual_mart") {
          if (model.parent != scene && !isInAnimationStarted)
            //
            animateModelIn(scene, model, projectModelsAnchors); //scene.remove(model);
        } else {
          if (model.parent == scene && !isOutAnimationStarted) {
            //
            animateModelOut(scene, model, projectModelsAnchors); //scene.add(model);
          }
        }
      });
    }
  }
}
