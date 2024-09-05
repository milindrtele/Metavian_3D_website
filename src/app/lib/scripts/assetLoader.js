import * as THREE from "three";
import { NodeToyMaterial } from "@nodetoy/three-nodetoy";
import { data } from "../shaders/scan_lines/scan_lines_shader_data.js";

let blenderCamera = null;
let mixer = null;
let capsule_model = null;
let capsule_anchor = null;
let cockpit_canopy = null;

let cubeCamera, cubeRenderTarget;

let projectModels = [];
let projectModelsAnchors = [];

export function loadAssetsWithPromise(
  loader,
  clip,
  productAssets,
  productAssetAnchor,
  scene
) {
  return new Promise((resolve, reject) => {
    let loadedModels = 0;
    const totalModels = 6; // Update the totalModels count to reflect all the models being loaded
    let cameraLoaded = false;

    cubeRenderTarget = new THREE.WebGLCubeRenderTarget(256);
    cubeRenderTarget.texture.type = THREE.HalfFloatType;

    cubeCamera = new THREE.CubeCamera(1, 1000, cubeRenderTarget);

    const checkIfAllLoaded = () => {
      loadedModels++;
      console.log(loadedModels);
      console.log(totalModels);
      console.log(cameraLoaded);
      console.log(capsule_model);
      if (
        loadedModels === totalModels &&
        cameraLoaded &&
        capsule_model != null
      ) {
        console.log("check");
        resolve(); // Resolve the promise once all models are loaded
      }
    };

    const loadModels = (
      index,
      url,
      anchorName,
      position,
      rotation,
      scale,
      name
    ) => {
      loader.load(
        url,
        (gltf) => {
          const assetScene = gltf.scene;
          assetScene.name = name;
          const assetAnchor = assetScene.getObjectByName(anchorName);
          if (position != null)
            assetAnchor.position.set(position.x, position.y, position.z);
          if (rotation != null)
            assetAnchor.rotation.set(
              (Math.PI / 180) * rotation.x,
              (Math.PI / 180) * rotation.y,
              (Math.PI / 180) * rotation.z
            );
          if (scale != null) assetAnchor.scale.set(scale.x, scale.y, scale.z);

          productAssets[index] = assetScene;
          productAssetAnchor[index] = assetAnchor;
          projectModels.push(assetScene);
          projectModelsAnchors.push(assetAnchor);
          //scene.add(assetScene);
          checkIfAllLoaded(); // Check if all models are loaded
        },
        undefined,
        reject
      );
    };

    //load the capsule
    loader.load(
      //"models/capsule/cosmos ship of imagination.glb",
      "models/capsule/new_capsule_2.glb",
      (gltf) => {
        capsule_model = gltf.scene;
        console.log(capsule_model);

        ///////////////////////////For ship of imagination/////////////////////////////////
        // const reflectiveMaterial = new THREE.MeshStandardMaterial({
        //   envMap: cubeRenderTarget.texture,
        //   roughness: 0.05,
        //   metalness: 1,
        // });

        // capsule_model.traverse((object) => {
        //   if (object.isMesh && object.name != "cockpit_canopy") {
        //     object.material = reflectiveMaterial;
        //   }
        // });
        // capsule_anchor = capsule_model.getObjectByName("anchor");

        ////////////////////////////////For Capsule/////////////////////////////////////////////

        const capsuleStartingPos = {
          x: 10, // blender_x
          y: 50, // blender_z
          z: -95, // -1 * blender_y
        };
        const spotForCapsule = new THREE.SpotLight(0xffffff, 100000);
        spotForCapsule.position.set(
          capsuleStartingPos.x,
          capsuleStartingPos.y + 10,
          capsuleStartingPos.z
        );
        spotForCapsule.penumbra = 0.5;
        spotForCapsule.distance = 500;
        //spotlight1.angle = (Math.PI / 180) * 35;
        capsule_anchor = capsule_model.getObjectByName("capsule_anchor");
        capsule_anchor.position.set(
          capsuleStartingPos.x,
          capsuleStartingPos.y,
          capsuleStartingPos.z
        );
        // capsule_anchor.rotation.y = (Math.PI / 180) * -15;

        const reflectiveMaterial = new THREE.MeshStandardMaterial({
          envMap: cubeRenderTarget.texture,
          roughness: 0.05,
          metalness: 1,
        });

        const glass = new NodeToyMaterial({
          url: "https://draft.nodetoy.co/ECrNY8O4MMUUagsb", //"https://draft.nodetoy.co/w7BhuuAcZ2ESIjU5", //,
        });
        glass.side = THREE.DoubleSide;

        capsule_model.traverse((object) => {
          if (object.isMesh) {
            object.material.envMap = cubeRenderTarget.texture;

            if (object.name == "cockpit_canopy") {
              cockpit_canopy = object;
              cockpit_canopy.material = glass;
              cockpit_canopy.material.side = THREE.DoubleSide;
            }

            // if (object.material.name == "metal") {
            //   object.material = reflectiveMaterial;
            // } else if (object.material.name == "glass") {
            //   object.material.envMap = cubeRenderTarget.texture;
            // }
          }
        });

        // const scan_lines_plane =
        //   capsule_model.getObjectByName("scan_lines_mesh");
        // scan_lines_plane.material = new NodeToyMaterial({
        //   data,
        //   //url: "https://draft.nodetoy.co/teCGtR1LIJGk4CO1",
        // });
        // scan_lines_plane.material.side = THREE.DoubleSide;

        console.log(capsule_model);

        loadProjectModels();
      },
      undefined,
      reject
    );

    // Load camera animation
    loader.load(
      "models/positioned assets 2/camera_01.glb",
      (gltf) => {
        blenderCamera = gltf.cameras[0];
        clip = THREE.AnimationClip.findByName(
          gltf.animations,
          "CameraAction.003"
        );
        mixer = new THREE.AnimationMixer(blenderCamera);
        const action = mixer.clipAction(clip);
        action.play();
        cameraLoaded = true;
      },
      undefined,
      reject
    );

    function loadProjectModels() {
      // Load models
      loadModels(
        0,
        "models/positioned assets 2/car_config_2.glb",
        "anchor",
        null,
        null,
        null,
        "car_configurator"
      );
      loadModels(
        1,
        "models/positioned assets 2/virtual_mart_2.glb",
        "anchor",
        null,
        null,
        null,
        "virtual_mart"
      );
      loadModels(
        2,
        "models/positioned assets 2/fashion_ix.glb",
        "anchor",
        null,
        null,
        null,
        "fashion_ix"
      );
      loadModels(
        3,
        "models/positioned assets 2/edulab_2.glb",
        "anchor",
        null,
        null,
        null,
        "edulab_v1"
      );
      loadModels(
        4,
        "models/positioned assets 2/virtual_production.glb",
        "anchor",
        null,
        null,
        null,
        "virtual_production"
      );
      loadModels(
        5,
        "models/positioned assets 2/meta_realty.glb",
        "anchor",
        null,
        null,
        null,
        "meta_realty"
      );
    }
  });
}

export {
  blenderCamera,
  mixer,
  capsule_model,
  capsule_anchor,
  cockpit_canopy,
  cubeCamera,
  projectModels,
  projectModelsAnchors,
};
