import * as THREE from "three";
import {
  CSS3DRenderer,
  CSS3DObject,
} from "three/addons/renderers/CSS3DRenderer.js";
import { NodeToyMaterial } from "@nodetoy/three-nodetoy";
import { data } from "../shaders/scan_lines/scan_lines_shader_data.js";
import { RGBELoader } from "three/addons/loaders/RGBELoader.js";

import { teamHandler } from "./team.js";
import { printerHandler } from "./printer.js";

import Hotspot from "./hotspot";

import { gsap } from "gsap";

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

//let cubeCamera, cubeRenderTarget;

let projectModels = [];
let projectModelsAnchors = [];

let hdrImage = null;

let media_model_array = null;
let spot_lights_array = null;

let social_media_models_scene = null;

let highlighter_objects_array = null;

let letters_anchor = null;
let address_icon_anchor = null;
let email_icon_anchor = null;
let phone_icon_anchor = null;

let icon_animations = null;

let teamScene = null;
let printerScene = null;

let hotspotData = null;

let hotspotsArray = [];

export function loadAssetsWithPromise(
  loader,
  clip,
  productAssets,
  productAssetAnchor,
  scene,
  css2DScene,
  mainCamera,
  setProductToviewFunction,
  productPageVisible
) {
  return new Promise((resolve, reject) => {
    let loadedModels = 0;
    const totalModels = 6; // Update the totalModels count to reflect all the models being loaded
    let cameraLoaded = false;

    // cubeRenderTarget = new THREE.WebGLCubeRenderTarget(256);
    // cubeRenderTarget.texture.type = THREE.HalfFloatType;

    // cubeCamera = new THREE.CubeCamera(1, 1000, cubeRenderTarget);

    const check = () => {
      const checkValue = () => {
        console.log(productPageVisible);
        requestAnimationFrame(checkValue);
      };
      requestAnimationFrame(checkValue);
    };
    check();

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

    // Fetch product data from JSON file
    async function findProductData(url) {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        return data;
      } catch (error) {
        console.error("Failed to fetch texture data:", error);
        return null;
      }
    }

    // Find texture data for a specific roof texture name
    async function find_From_Data(name) {
      if (!hotspotData) {
        hotspotData = await findProductData("/json/hotspotData.json");
      }
      return hotspotData?.find((item) => item.productName === name);
    }

    const loadModels = (
      index,
      url,
      anchorName,
      position,
      rotation,
      scale,
      name,
      callback,
      hotSpotConfig,
      mainCamera,
      productViewerCallback,
      productPageVisible
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

          //enable shadows for all objects
          // scene.traverse((child) => {
          //   if (child instanceof THREE.Mesh) {
          //     child.castShadow = true;
          //     child.receiveShadow = true;
          //   }
          // });

          console.log(hotSpotConfig);
          if (hotSpotConfig != null) {
            //css2DHotspot
            const mainHotspotData = hotSpotConfig.mainHotspot;
            console.log(hotSpotConfig);
            const hotspotInstance = new Hotspot(
              css2DScene,
              mainHotspotData.hotSpotPos,
              mainHotspotData.distanceFormCam,
              mainHotspotData.childHtmlUrl,
              mainHotspotData.title,
              mainHotspotData.subTitle,
              mainHotspotData.videoID,
              mainHotspotData.webURL,
              mainCamera,
              productViewerCallback,
              productPageVisible
            );
            hotspotInstance.addToScene();
            hotspotsArray.push(hotspotInstance);
            console.log(hotspotsArray);
          }
          // if (hotSpotConfig != null) {
          //   //css2DHotspot
          //   const hotspotInstance = new Hotspot(
          //     css2DScene,
          //     hotSpotConfig.hotSpotPos,
          //     hotSpotConfig.distanceFormCam,
          //     hotSpotConfig.childHtmlUrl,
          //     hotSpotConfig.title,
          //     hotSpotConfig.subTitle,
          //     hotSpotConfig.stemHeight,
          //     hotSpotConfig.buttonWidth,
          //     hotSpotConfig.angle,
          //     hotSpotConfig.flagPosition,
          //     // hotSpotConfig.callbackFunction
          //     //   ? window[hotSpotConfig.callbackFunction]
          //     //   : undefined,
          //     // hotSpotConfig.videoEmbedFunction,
          //     //hotSpotConfig.videoID,
          //     hotSpotConfig.webURL,
          //     mainCamera,
          //     productViewerCallback
          //   );
          //   hotspotInstance.addToScene();
          // }
        },
        undefined,
        reject
      );
    };

    // Load the social media models
    loader.load(
      //"/models/contact models/contact_models_with_vr_headset_with_animations.glb",
      "/models/contact models/contact_models_with_vr_headset_with_animation_and_optimisation.glb",
      //"/models/contact models/contacts_model_with_highliter_v01.glb",
      (gltf) => {
        social_media_models_scene = gltf.scene;
        //scene.add(social_media_models_scene);
        console.log(gltf);
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

        /////spot lights
        const spot_headset =
          social_media_models_scene.getObjectByName("spot_headset");
        const media_spot_light_01 = social_media_models_scene.getObjectByName(
          "spot_social_media_1"
        );
        const media_spot_light_02 = social_media_models_scene.getObjectByName(
          "spot_social_media_2"
        );
        const media_spot_light_03 = social_media_models_scene.getObjectByName(
          "spot_social_media_3"
        );
        const media_spot_light_04 = social_media_models_scene.getObjectByName(
          "spot_social_media_4"
        );

        ////highliters
        const highLighter_address_vertical_1 =
          social_media_models_scene.getObjectByName("highlighter_address001");
        const highLighter_address_vertical_2 =
          social_media_models_scene.getObjectByName("highlighter_address002");
        const highLighter_address_container =
          social_media_models_scene.getObjectByName("highlighter_address");
        //
        const highLighter_email_container =
          social_media_models_scene.getObjectByName("highlighter_email");
        const highLighter_email_vertical_1 =
          social_media_models_scene.getObjectByName("highlighter_email001");
        const highLighter_email_vertical_2 =
          social_media_models_scene.getObjectByName("highlighter_email002");
        //
        const highLighter_phone_container =
          social_media_models_scene.getObjectByName("highlighter_phone");
        const highLighter_phone_vertical_1 =
          social_media_models_scene.getObjectByName("highlighter_phone001");
        const highLighter_phone_vertical_2 =
          social_media_models_scene.getObjectByName("highlighter_phone002");

        highlighter_objects_array = [
          highLighter_address_container,
          highLighter_address_vertical_1,
          highLighter_address_vertical_2,
          highLighter_email_container,
          highLighter_email_vertical_1,
          highLighter_email_vertical_2,
          highLighter_phone_container,
          highLighter_phone_vertical_1,
          highLighter_phone_vertical_2,
        ];

        const highliter_material_vertical = new NodeToyMaterial({
          url: "https://draft.nodetoy.co/DuJx74XfnsNXkANU",
        });
        const highliter_material_horizontal = new NodeToyMaterial({
          url: "https://draft.nodetoy.co/3XP4G9zeQ6rdQNx5",
        });

        highliter_material_vertical.side = THREE.DoubleSide;
        highliter_material_horizontal.side = THREE.DoubleSide;

        highLighter_address_vertical_1.material = highliter_material_vertical;
        highLighter_address_vertical_2.material = highliter_material_vertical;
        highLighter_email_vertical_1.material = highliter_material_vertical;
        highLighter_email_vertical_2.material = highliter_material_vertical;
        highLighter_phone_vertical_1.material = highliter_material_vertical;
        highLighter_phone_vertical_2.material = highliter_material_vertical;
        //spot_headset.intensity = 0;

        //letters
        letters_anchor =
          social_media_models_scene.getObjectByName("letters_anchor");

        //anchor_icons
        address_icon_anchor = social_media_models_scene.getObjectByName(
          "address_icon_anchor"
        );
        email_icon_anchor =
          social_media_models_scene.getObjectByName("email_icon_anchor");
        phone_icon_anchor =
          social_media_models_scene.getObjectByName("phone_icon_anchor");

        // // click to modify the underlined values
        let position_address_icon_anchor = address_icon_anchor.position;
        const address_icon_animation = gsap.to(position_address_icon_anchor, {
          duration: 2.5,
          ease: "power1.inOut",
          y: 1.5,
          stagger: { each: 0.15, yoyo: true, repeat: -1 },
        });
        let position_email_icon_anchor = email_icon_anchor.position;
        const email_icon_animation = gsap.to(position_email_icon_anchor, {
          duration: 2.5,
          delay: 0.5,
          ease: "power1.inOut",
          y: 1.5,
          stagger: { each: 0.15, yoyo: true, repeat: -1 },
        });
        let position_phone_icon_anchor = phone_icon_anchor.position;
        const phone_icon_animation = gsap.to(position_phone_icon_anchor, {
          duration: 2.5,
          delay: 1,
          ease: "power1.inOut",
          y: 1.5,
          stagger: { each: 0.15, yoyo: true, repeat: -1 },
        });

        icon_animations = [
          address_icon_animation,
          email_icon_animation,
          phone_icon_animation,
        ];

        // social_media_models_scene.traverse((object) => {
        //   if (object.isMesh) {
        //     object.material.envMap = cubeRenderTarget.texture;
        //   }
        // });

        media_model_array = [
          media_01_anchor,
          media_02_anchor,
          media_03_anchor,
          media_04_anchor,
        ];

        spot_lights_array = [
          media_spot_light_01,
          media_spot_light_02,
          media_spot_light_03,
          media_spot_light_04,
        ];

        //scene.add(headset_anchor);

        media_model_array.forEach((object) => {
          console.log(object);
          //scene.add(object);
          //object.visible = false;
        });

        contact_model_Camera = gltf.cameras[0];
        const camera_clip = THREE.AnimationClip.findByName(
          gltf.animations,
          "Camera"
        );
        contact_models_animation_mixer = new THREE.AnimationMixer(
          contact_model_Camera
        );
        const action = contact_models_animation_mixer.clipAction(camera_clip);
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
      "models/capsule/capsule/capsule_textured_with projection_display_legs_1_1k.glb",
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
          //envMap: cubeRenderTarget.texture,
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
        console.log(gltf);
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

    //function modelSelectionCallback(productName) {}

    function loadProjectModels() {
      //Load models

      //Car Configurator
      find_From_Data("Car Configurator").then((hotspotData) => {
        console.log(hotspotData);
        loadModels(
          0,
          "models/Consolidated models/saperated_animated_models/car_configurator/car_configurator_white_withShadows.glb",
          "anchor",
          null,
          null,
          null,
          "car_configurator",
          null,
          hotspotData,
          // {
          //   hotSpotPos: new THREE.Vector3(43.4799, 0, -25.2621),
          //   distanceFormCam: 30,
          //   childHtmlUrl: "/innerHtml/hotspot.html",
          //   title: "Car Configurator",
          //   subTitle: "Visualize your next car",
          //   stemHeight: 125,
          //   buttonWidth: 10,
          //   angle: 50,
          //   flagPosition: "start",
          //   // callbackFunction? window[callbackFunction]: undefined,
          //   // videoEmbedFunction: ,
          //   // videoID,
          //   webURL: "https://www.surajwaterpark.com/",
          // },
          mainCamera,
          setProductToviewFunction,
          productPageVisible
        );
      });
      // loadModels(
      //   0,
      //   "models/Consolidated models/saperated_animated_models/car_configurator/car_configurator_white_withShadows.glb",
      //   "anchor",
      //   null,
      //   null,
      //   null,
      //   "car_configurator",
      //   null,
      //   //hotspotData,
      //   {
      //     hotSpotPos: new THREE.Vector3(43.4799, 0, -25.2621),
      //     distanceFormCam: 30,
      //     childHtmlUrl: "/innerHtml/hotspot.html",
      //     title: "Car Configurator",
      //     subTitle: "Visualize your next car",
      //     stemHeight: 125,
      //     buttonWidth: 10,
      //     angle: 50,
      //     flagPosition: "start",
      //     // callbackFunction? window[callbackFunction]: undefined,
      //     // videoEmbedFunction: ,
      //     // videoID,
      //     webURL: "https://www.surajwaterpark.com/",
      //   },
      //   mainCamera,
      //   setProductToviewFunction,
      //   productPageVisible
      // );

      //////////Virtual Mart
      find_From_Data("Virtual Mart").then((hotspotData) => {
        loadModels(
          1,
          "models/Consolidated models/saperated_animated_models/virtual_mart/virtual_mart_white_withShadows.glb", //"models/positioned assets 2/virtual_mart_2.glb",
          "anchor",
          null,
          null,
          null,
          "virtual_mart",
          null,
          hotspotData,
          // {
          //   hotSpotPos: new THREE.Vector3(6.84667, 1.88283, -58.2661),
          //   distanceFormCam: 50,
          //   childHtmlUrl: "/innerHtml/hotspot.html",
          //   title: "Virtual Mart",
          //   subTitle: "Virtual shopping experience",
          //   stemHeight: 125,
          //   buttonWidth: 10,
          //   angle: 50,
          //   flagPosition: "start",
          //   // callbackFunction? window[callbackFunction]: undefined,
          //   // videoEmbedFunction: ,
          //   //videoID,
          //   webURL: "https://www.surajwaterpark.com/",
          // },
          mainCamera,
          setProductToviewFunction,
          productPageVisible
        );
      });

      // loadModels(
      //   1,
      //   "models/Consolidated models/saperated_animated_models/virtual_mart/virtual_mart_white_withShadows.glb", //"models/positioned assets 2/virtual_mart_2.glb",
      //   "anchor",
      //   null,
      //   null,
      //   null,
      //   "virtual_mart",
      //   null,
      //   {
      //     hotSpotPos: new THREE.Vector3(6.84667, 1.88283, -58.2661),
      //     distanceFormCam: 50,
      //     childHtmlUrl: "/innerHtml/hotspot.html",
      //     title: "Virtual Mart",
      //     subTitle: "Virtual shopping experience",
      //     stemHeight: 125,
      //     buttonWidth: 10,
      //     angle: 50,
      //     flagPosition: "start",
      //     // callbackFunction? window[callbackFunction]: undefined,
      //     // videoEmbedFunction: ,
      //     //videoID,
      //     webURL: "https://www.surajwaterpark.com/",
      //   },
      //   mainCamera,
      //   setProductToviewFunction,
      //   productPageVisible
      // );

      //Fashion IX
      find_From_Data("Fashion IX").then((hotspotData) => {
        loadModels(
          2,
          "models/Consolidated models/saperated_animated_models/fashion_ix/fashion_ix_white_withShadows.glb", //"models/positioned assets 2/fashion_ix.glb",
          "anchor",
          null,
          null,
          null,
          "fashion_ix",
          null,
          hotspotData,
          // {
          //   hotSpotPos: new THREE.Vector3(-48.2198, 3.26697, -39.6031),
          //   distanceFormCam: 30,
          //   childHtmlUrl: "/innerHtml/hotspot.html",
          //   title: "Fashion IX",
          //   subTitle: "Virtual fashion experience",
          //   stemHeight: 125,
          //   buttonWidth: 10,
          //   angle: 50,
          //   flagPosition: "start",
          //   // callbackFunction? window[callbackFunction]: undefined,
          //   // videoEmbedFunction: ,
          //   //videoID,
          //   webURL: "https://www.surajwaterpark.com/",
          // },
          mainCamera,
          setProductToviewFunction,
          productPageVisible
        );
      });

      find_From_Data("Edulab").then((hotspotData) => {
        loadModels(
          3,
          "models/Consolidated models/saperated_animated_models/edulab/edulab_white_withShadows.glb", //"models/positioned assets 2/edulab_2.glb",
          "anchor",
          null,
          null,
          null,
          "edulab_v1",
          null,
          hotspotData,
          // {
          //   hotSpotPos: new THREE.Vector3(-50.4376, 0, 13.7845),
          //   distanceFormCam: 30,
          //   childHtmlUrl: "/innerHtml/hotspot.html",
          //   title: "Edulab",
          //   subTitle: "Education in VR",
          //   stemHeight: 125,
          //   buttonWidth: 10,
          //   angle: 50,
          //   flagPosition: "start",
          //   // callbackFunction? window[callbackFunction]: undefined,
          //   // videoEmbedFunction: ,
          //   //videoID,
          //   webURL: "https://www.surajwaterpark.com/",
          // },
          mainCamera,
          setProductToviewFunction,
          productPageVisible
        );
      });

      find_From_Data("Virtual Production").then((hotspotData) => {
        loadModels(
          4,
          "models/Consolidated models/saperated_animated_models/virtual_production/virtual_production_white_withShadows.glb", //"models/positioned assets 2/virtual_production.glb",
          "anchor",
          null,
          null,
          null,
          "virtual_production",
          null,
          hotspotData,
          // {
          //   hotSpotPos: new THREE.Vector3(-4.10703, 5.07101, 54.2712),
          //   distanceFormCam: 30,
          //   childHtmlUrl: "/innerHtml/hotspot.html",
          //   title: "Virtual Production",
          //   subTitle: "Virtual media production",
          //   stemHeight: 125,
          //   buttonWidth: 10,
          //   angle: 50,
          //   flagPosition: "start",
          //   // callbackFunction? window[callbackFunction]: undefined,
          //   // videoEmbedFunction: ,
          //   //videoID,
          //   webURL: "https://www.surajwaterpark.com/",
          // },
          mainCamera,
          setProductToviewFunction,
          productPageVisible
        );
      });

      find_From_Data("Meta Realty").then((hotspotData) => {
        loadModels(
          5,
          "models/Consolidated models/saperated_animated_models/meta_realty/meta_realty_white_withShadows.glb", //"models/positioned assets 2/meta_realty.glb",
          "anchor",
          null,
          null,
          null,
          "meta_realty",
          null,
          hotspotData,
          // {
          //   hotSpotPos: new THREE.Vector3(45.575, 6.24498, 36.8055),
          //   distanceFormCam: 30,
          //   childHtmlUrl: "/innerHtml/hotspot.html",
          //   title: "Meta Realty",
          //   subTitle: "Visualise Realty in 3D",
          //   stemHeight: 125,
          //   buttonWidth: 10,
          //   angle: 50,
          //   flagPosition: "start",
          //   // callbackFunction? window[callbackFunction]: undefined,
          //   // videoEmbedFunction: ,
          //   //videoID,
          //   webURL: "https://www.surajwaterpark.com/",
          // },
          mainCamera,
          setProductToviewFunction,
          productPageVisible
        );
      });

      teamScene = new teamHandler(scene, loader);
      printerScene = new printerHandler(scene, loader);
      //teamScene.addToScene();
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
  //cubeCamera,
  projectModels,
  projectModelsAnchors,
  animationMixers,
  media_model_array,
  social_media_models_scene,
  spot_lights_array,
  highlighter_objects_array,
  letters_anchor,
  icon_animations,
  teamScene,
  printerScene,
  hotspotsArray,
};
