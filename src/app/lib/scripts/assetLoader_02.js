import * as THREE from "three";
import {
  CSS3DRenderer,
  CSS3DObject,
} from "three/addons/renderers/CSS3DRenderer.js";
import { NodeToyMaterial } from "@nodetoy/three-nodetoy";
import { data } from "../shaders/scan_lines/scan_lines_shader_data.js";
import { RGBELoader } from "three/addons/loaders/RGBELoader.js";

let blenderCamera = null;
let contact_model_Camera = null;
let animationMixers = [];
let mixer = null;
let contact_models_animation_mixer = null;
let capsule_model = null;
let capsule_anchor = null;
let capsule_body = null;
let cockpit_canopy = null;
let projection_screen_anchor = null;
let projection_object = null;
let legs_parent = null;

let cubeCamera, cubeRenderTarget;

let projectModels = [];
let projectModelsAnchors = [];

let hdrImage = null;

let media_model_array = null;

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
      if (
        loadedModels === totalModels &&
        cameraLoaded &&
        capsule_model != null
      ) {
        //console.log("check");
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
      name,
      callback
    ) => {
      loader.load(
        url,
        (gltf) => {
          //console.log(gltf);
          //mixerRef.current = mixer;
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
          scene.add(assetScene);

          //load model animation in the mixer array
          const model = gltf.scene.getObjectByName("model");
          const clip = THREE.AnimationClip.findByName(
            gltf.animations,
            "scaleUpDown"
          );
          const ani_Mixer = new THREE.AnimationMixer(model);
          const action = ani_Mixer.clipAction(clip);
          animationMixers.push(ani_Mixer);
          action.play();
          cameraLoaded = true;
          checkIfAllLoaded(); // Check if all models are loaded
          if (callback) {
            callback;
          }
        },
        undefined,
        reject
      );
    };

    // Load the social media models
    loader.load(
      "/models/contact models/contact_models_with_vr_headset_with_camera_animation_v1.glb",
      (gltf) => {
        const social_media_models_scene = gltf.scene;
        scene.add(social_media_models_scene);
        console.log(social_media_models_scene);
        const headset_anchor =
          social_media_models_scene.getObjectByName("headset_anchor");
        const media_01_anchor =
          social_media_models_scene.getObjectByName("media_1");
        const media_02_anchor =
          social_media_models_scene.getObjectByName("media_2");
        const media_03_anchor =
          social_media_models_scene.getObjectByName("media_3");
        const media_04_anchor =
          social_media_models_scene.getObjectByName("media_4");
        const media_05_anchor =
          social_media_models_scene.getObjectByName("media_5");

        social_media_models_scene.traverse((object) => {
          if (object.isMesh) {
            object.material.envMap = cubeRenderTarget.texture;
          }
        });

        media_model_array = [
          media_01_anchor,
          media_02_anchor,
          media_03_anchor,
          media_04_anchor,
          media_05_anchor,
        ];

        scene.add(headset_anchor);

        media_model_array.forEach((object) => {
          console.log(object);
          scene.add(object);
          //object.visible = false;
        });

        contact_model_Camera = gltf.cameras[0];
        const camera_clip = THREE.AnimationClip.findByName(
          gltf.animations,
          "Action"
        );
        contact_models_animation_mixer = new THREE.AnimationMixer(
          contact_model_Camera
        );
        const action = mixer.clipAction(camera_clip);
        action.play();
      },
      undefined,
      (error) => {
        console.log("social media models not loaded" + error);
      }
    );
    //load the capsule
    loader.load(
      //"models/capsule/cosmos ship of imagination.glb",
      "models/capsule/capsule/capsule_textured_with projection_display_legs_1.glb",
      (gltf) => {
        capsule_model = gltf.scene;
        //console.log(capsule_model);

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
        capsule_body = capsule_model.getObjectByName("capsule_body");
        console.log(capsule_body.rotation.y);
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

        // const capsule_material = new THREE.MeshBasicMaterial({
        //   map: new THREE.TextureLoader().load(
        //     "models/capsule/capsule/new_baked_textures/diffuse_combined.png"
        //   ),
        //   normalMap: new THREE.TextureLoader().load(
        //     "models/capsule/capsule/new_baked_textures/normal_map.png"
        //   ),
        //   normalMap: new THREE.TextureLoader().load(
        //     "models/capsule/capsule/new_baked_textures/roughness_map.png"
        //   ),
        // });

        const glass = new NodeToyMaterial({
          url: "https://draft.nodetoy.co/dcJa9nhyWG5d8MeY", //https://draft.nodetoy.co/bzBoaIaQXpLm3UTR, //"https://draft.nodetoy.co/w7BhuuAcZ2ESIjU5", //https://draft.nodetoy.co/ECrNY8O4MMUUagsb,
        });
        glass.side = THREE.FrontSide;

        const projection = new NodeToyMaterial({
          url: "https://draft.nodetoy.co/3AFHZMh0a2doiywy", //https://draft.nodetoy.co/bzBoaIaQXpLm3UTR, //"https://draft.nodetoy.co/w7BhuuAcZ2ESIjU5", //https://draft.nodetoy.co/ECrNY8O4MMUUagsb,
        });
        projection.side = THREE.DoubleSide;

        console.log(projection.uniforms);
        //projection.uniforms.offset.value.y = 1;

        projection_object = capsule_model.getObjectByName("projection");

        projection_object.material = projection;

        const helix_1 = capsule_model.getObjectByName("helix_1");
        const helix_2 = capsule_model.getObjectByName("helix_2");

        legs_parent = capsule_model.getObjectByName("legs_parent");

        // helix_1.material = projection;
        // helix_2.material = projection;

        projection_screen_anchor = capsule_model.getObjectByName(
          "projected_screen_anchor"
        );

        function loadHDRI() {
          return new Promise((resolve, reject) => {
            new RGBELoader()
              .setPath("models/capsule/capsule/")
              .load("brown_photostudio_01_1k.hdr", function (texture) {
                hdrImage = texture;
                hdrImage.mapping = THREE.EquirectangularReflectionMapping;
                //console.log(hdrImage);
                resolve();
              });
          });
        }

        loadHDRI().then(() => {
          capsule_model.traverse((object) => {
            if (object.isMesh) {
              //object.material.envMap = cubeRenderTarget.texture;
              //object.material = capsule_material;
              object.material.envMap = hdrImage;

              if (object.name == "cockpit_canopy") {
                cockpit_canopy = object;
                cockpit_canopy.material = glass;
                cockpit_canopy.material.side = THREE.DoubleSide;
              }

              //console.log(object.material);

              // if (object.material.name == "metal") {
              //   object.material = reflectiveMaterial;
              // } else if (object.material.name == "glass") {
              //   object.material.envMap = cubeRenderTarget.texture;
              // }
            }
          });
        });

        // const scan_lines_plane =
        //   capsule_model.getObjectByName("cockpit_canopy");
        // scan_lines_plane.material = new NodeToyMaterial({
        //   // data,
        //   url: "https://draft.nodetoy.co/teCGtR1LIJGk4CO1",
        // });
        // scan_lines_plane.material.side = THREE.DoubleSide;

        // console.log(capsule_model);

        loadProjectModels();
        hideProjectionScreen(projection_object);
      },
      undefined,
      reject
    );

    function hideProjectionScreen(object) {
      object.visible = false;
    }

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
        "models/Consolidated models/saperated_animated_models/car_configurator/car_configurator.glb",
        "anchor",
        null,
        null,
        null,
        "car_configurator"
      );
      loadModels(
        1,
        "models/Consolidated models/saperated_animated_models/virtual_mart/virtual_mart1.glb", //"models/positioned assets 2/virtual_mart_2.glb",
        "anchor",
        null,
        null,
        null,
        "virtual_mart"
      );
      loadModels(
        2,
        "models/Consolidated models/saperated_animated_models/fashion_ix/fashion_ix1.glb", //"models/positioned assets 2/fashion_ix.glb",
        "anchor",
        null,
        null,
        null,
        "fashion_ix"
      );
      loadModels(
        3,
        "models/Consolidated models/saperated_animated_models/edulab/edulab1.glb", //"models/positioned assets 2/edulab_2.glb",
        "anchor",
        null,
        null,
        null,
        "edulab_v1"
      );
      loadModels(
        4,
        "models/Consolidated models/saperated_animated_models/virtual_production/virtual_production1.glb", //"models/positioned assets 2/virtual_production.glb",
        "anchor",
        null,
        null,
        null,
        "virtual_production"
      );
      loadModels(
        5,
        "models/Consolidated models/saperated_animated_models/meta_realty/meta_realty.glb", //"models/positioned assets 2/meta_realty.glb",
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
  contact_model_Camera,
  mixer,
  contact_models_animation_mixer,
  capsule_model,
  capsule_anchor,
  capsule_body,
  projection_screen_anchor,
  projection_object,
  legs_parent,
  cockpit_canopy,
  cubeCamera,
  projectModels,
  projectModelsAnchors,
  animationMixers,
  media_model_array,
};
