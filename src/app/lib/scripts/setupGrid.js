import * as THREE from "three";
import { InstancedMesh2 } from "@three.ez/instanced-mesh";

import gridVertex from "../shaders/grid_shader/gridVertex.glsl";
import gridFragment from "../shaders/grid_shader/gridFragment.glsl";

let hexagon = null;
let matcapTexture = null;
let instancedMeshObject1 = null;
let instancedMeshObject2 = null;
let uniformsForGrid = null;

export function setupGrid(renderer, loader, uniformsForGrid, scene) {
  loader.load("/models/hexa_with_edge_single_object_scaled.glb", (gltf) => {
    ///"/models/hexa_with_edge_AO_3.glb"
    //hexagon_b.glb
    hexagon = gltf.scene;
    console.log(hexagon);
    //hexagon.position.set(0, -5, 0);
    //scene.add(hexagon);

    const textureLoader = new THREE.TextureLoader();
    matcapTexture = textureLoader.load("/textures/matcap_texture_04.png");

    const aoTexture = textureLoader.load("/texture_maps/ao_map.jpg");
    aoTexture.flipY = false;

    matcapTexture.colorSpace = THREE.SRGBColorSpace;
    let matCapMaterial = new THREE.MeshMatcapMaterial({
      matcap: matcapTexture,
    });

    // Now that the base cube is loaded, create the InstancedMesh
    let mat = new THREE.MeshPhysicalMaterial({
      color: 0x5d294f, //0x363636
      roughness: 0.3,
      // metalness: 1,
      // sheen: 1,
      // sheenColor: 0xadc921,
      // sheenRoughness: 0,
      aoMap: aoTexture,
    });
    let mat2 = new THREE.MeshPhysicalMaterial({
      color: 0x5d294f, //0x363636
      roughness: 0.3,
      // metalness: 1,
      // sheen: 1,
      // sheenColor: 0xadc921,
      // sheenRoughness: 0,
      aoMap: aoTexture,
    });

    const dummyMaterial1 = new THREE.MeshStandardMaterial({
      color: 0x505050,
    });

    const dummyMaterial2 = new THREE.MeshStandardMaterial({
      color: 0x505050,
    });

    const gridShaderMaterial = new THREE.ShaderMaterial({
      uniforms: {
        ...uniformsForGrid,
      },

      vertexShader: gridVertex,
      fragmentShader: gridFragment,
    });

    // uniformsForGrid = {
    //   bottom_level: { value: 0.1 },
    //   crest: { value: 100.0 },
    //   amplitude: { value: 100.0 },
    //   start_level: { value: 1.0 },
    //   frequency: { value: 5.0 },
    //   overallAnimationLevel: overallAnimationLevelJS,
    //   // rotationAngle: rotationAngleJS,
    //   // vScale: scaleJS,
    //   rotationAngle: { value: 0 },
    //   vScale: { value: 1.0 },
    //   vScaleRing: scaleRingJS,
    //   time: timeUniform,
    //   uFBO: {
    //     value: fbo.texture,
    //   },
    // };

    /////////////////////////////////////////////////////////////////////////////////

    // const blankPlaneTexture = textureLoader.load("images/grid.png");
    // blankPlaneTexture.wrapS = blankPlaneTexture.wrapT = THREE.RepeatWrapping;
    // blankPlaneTexture.offset.set(0, 0);
    // blankPlaneTexture.repeat.set(3000, 3000);
    const blankPlaneTextureNormal = textureLoader.load("images/baked.png");
    blankPlaneTextureNormal.wrapS = blankPlaneTextureNormal.wrapT =
      THREE.RepeatWrapping;
    blankPlaneTextureNormal.offset.set(0, 0);
    blankPlaneTextureNormal.repeat.set(4000, 4000);
    //const blankPlaneGeo = new THREE.PlaneGeometry(10000, 10000);
    const blankPlaneMat = new THREE.MeshStandardMaterial({
      color: 0x393939,
      // /map: blankPlaneTexture,
      //roughnessMap: blankPlaneTexture,
      normalMap: blankPlaneTextureNormal,
      normalScale: new THREE.Vector2(0.5, 0.5),
      roughness: 0.01,
      transparent: true,
    });
    //const blankPlaneMesh = new THREE.Mesh(blankPlaneGeo, blankPlaneMat);
    //blankPlaneMesh.rotation.x = (Math.PI / 180) * -90;
    // blankPlaneMesh.rotation.z = (Math.PI / 180) * -90;
    //blankPlaneMesh.position.set(0, -5.5, 0);
    //scene.add(blankPlaneMesh);

    loader.load("/models/blank_plane.glb", (gltf) => {
      const blank_planeMesh = gltf.scene;
      blank_planeMesh.children[0].material = blankPlaneMat;
      //blank_planeMesh.scale.set(new THREE.Vector3(2, 1, 2));
      scene.add(blank_planeMesh);
    });

    const multiplyer = 2;
    let rows = 250 / multiplyer;
    let count = rows * rows;

    let random = new Float32Array(count);

    let instanceUV = new Float32Array(count * 2);
    let instance2UV = new Float32Array(count * 2);

    hexagon.children[0].geometry.scale(multiplyer, multiplyer, multiplyer);
    hexagon.children[0].geometry.setAttribute(
      "aRandom",
      new THREE.InstancedBufferAttribute(random, 1)
    );
    hexagon.children[0].geometry.setAttribute(
      "instanceUV",
      new THREE.InstancedBufferAttribute(instanceUV, 2)
    );

    // instancedMeshObject1 = new InstancedMesh2(
    //   renderer,
    //   count,
    //   hexagon.children[0].geometry,
    //   //dummyMaterial1
    //   gridShaderMaterial
    // );
    // instancedMeshObject2 = new InstancedMesh2(
    //   renderer,
    //   count,
    //   hexagon.children[1].geometry,
    //   dummyMaterial2
    // );
    instancedMeshObject1 = new THREE.InstancedMesh(
      hexagon.children[0].geometry, // Use the geometry of the loaded cube
      mat2,
      count
    );
    // instancedMeshObject2 = new THREE.InstancedMesh(
    //   hexagon.children[1].geometry, // Use the geometry of the loaded cube
    //   mat2,
    //   count
    // );

    if (instancedMeshObject1.parent != scene) {
      scene.add(instancedMeshObject1);
    }
    // if (instancedMeshObject2.parent != scene) {
    //   scene.add(instancedMeshObject2);
    // }

    let index = 0;
    let spacing = 2; // Adjust this value to increase or decrease spacing
    let xSpacing = 2 * multiplyer; // original 1.73  // 2
    let ySpacing = 1.73 * multiplyer; // original 1.5   // 1.73
    const positioningConstant = 0.865 * multiplyer;
    let indexNo = 0;
    let dummy = new THREE.Object3D();
    //let dummy2 = new THREE.Object3D();
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < rows; j++) {
        random[index] = Math.random();
        if (j % 2 == 1) {
          dummy.position.set(
            positioningConstant + i * xSpacing - (rows * xSpacing) / 2,
            -5,
            j * ySpacing - (rows * ySpacing) / 2
          );
          // dummy2.position.set(
          //   0.865 + i * xSpacing - (rows * xSpacing) / 2,
          //   -5,
          //   j * ySpacing - (rows * ySpacing) / 2
          // );
        } else {
          dummy.position.set(
            i * xSpacing - (rows * xSpacing) / 2,
            -5,
            j * ySpacing - (rows * ySpacing) / 2
          );
          // dummy2.position.set(
          //   i * xSpacing - (rows * xSpacing) / 2,
          //   -5,
          //   j * ySpacing - (rows * ySpacing) / 2
          // );
        }
        instanceUV.set([i / rows, j / rows], (i * rows + j) * 2);
        //instance2UV.set([i / rows, j / rows], (i * rows + j) * 2);

        dummy.updateMatrix();
        //dummy2.updateMatrix();
        instancedMeshObject1.setMatrixAt(index++, dummy.matrix);
        //instancedMeshObject2.setMatrixAt(index++, dummy2.matrix);
      }
    }

    //instancedMeshObject1.computeBVH();
    //instancedMeshObject2.computeBVH();
    //instancedMeshObject1.instanceMatrix.needsUpdate = true;
    //instancedMeshObject2.instanceMatrix.needsUpdate = true;

    // instancedMeshObject1.geometry.setAttribute(
    //   "aRandom",
    //   new THREE.InstancedBufferAttribute(random, 1)
    // );
    // instancedMeshObject1.geometry.setAttribute(
    //   "instanceUV",
    //   new THREE.InstancedBufferAttribute(instanceUV, 2)
    // );
    console.log(instancedMeshObject1);
    //
    // instancedMeshObject2.geometry.setAttribute(
    //   "aRandom",
    //   new THREE.InstancedBufferAttribute(random, 1)
    // );
    // instancedMeshObject2.geometry.setAttribute(
    //   "instanceUV",
    //   new THREE.InstancedBufferAttribute(instanceUV, 2)
    // );

    //instancedMeshObject1.frustumCulled = true;
    //instancedMeshObject1.frustumCulled =
    //instancedMeshObject2.frustumCulled = true;

    //
    mat.onBeforeCompile = (shader) => {
      shader.uniforms = Object.assign(shader.uniforms, uniformsForGrid);
      shader.vertexShader = shader.vertexShader.replace(
        "#include <common>",
        `
          uniform sampler2D uFBO;
          uniform sampler2D uFBO2;
          uniform float time;
          uniform vec3 light_color;
          varying vec4 mvPosition;
          varying vec3 vPosition;
          varying vec3 uvHeight;
          varying float vHeight;

          attribute vec2 instanceUV;
          attribute float aRandom;
          uniform float rotationAngle;
          uniform float vScale;
          uniform float vScaleRing;
          uniform float overallAnimationLevel;
          uniform float bottom_level;
          uniform float crest;
          uniform float amplitude;
          uniform float start_level;
          uniform float frequency;
          `
      );
      shader.vertexShader = shader.vertexShader.replace(
        "#include <begin_vertex>",
        `
          #include <begin_vertex>

          //float bottom_level = bottom_levelJS;
          //float crest = crestJS;
          //float amplitude = amplitudeJS;
          //float start_level = start_levelJS;
          //float frequency = frequencyJS;

          float angle = rotationAngle * 3.14159265/180.0;
          vec2 pivot = vec2(0.5, 0.4);
          vec2 centeredUV = instanceUV - pivot;

          // Scaling
          float scale = vScale; // Change this to your desired scaling factor
          vec2 scaledUV = centeredUV * scale;

          // Rotation
          vec2 rotatedUV = vec2(
          scaledUV.x * cos(angle) - scaledUV.y * sin(angle),
          scaledUV.x * sin(angle) + scaledUV.y * cos(angle)
          );

          vec2 newUV = rotatedUV + pivot;
          vec4 transition = texture2D(uFBO, newUV);

          //float vAmplitude = (aRandom + sin(time * frequency * aRandom ) + start_level) * transition.g * crest * ////overallAnimationLevel / 40.0;
          float vAmplitude = ((sin(time * frequency * aRandom )) + aRandom + start_level) * transition.g;
          //float normalized_vAmplitude = clamp((vAmplitude - bottom_level) / (crest - bottom_level), 0.0, crest);
          float normalized_vAmplitude = clamp(vAmplitude, 0.0, crest);

          transformed.y += normalized_vAmplitude;

          vHeight = transformed.y;
          `
      );
      // shader.fragmentShader = shader.fragmentShader.replace(
      //   "#include <common>",
      //   `
      //       #include <common>
      //       varying vec3 uvHeight;
      //       varying float vHeight;
      //       varying vec4 mvPosition;
      //       `
      // );
      // shader.fragmentShader = shader.fragmentShader.replace(
      //   "#include <color_fragment>",
      //   `
      //       #include <color_fragment>
      //       // Define the expected range of vHeight values
      //       const float minHeight = 0.0;
      //       const float maxHeight = 1.0; // Adjust based on your specific range

      //       // Normalize vHeight between 0 and 1
      //       float normalized_vHeight = clamp((vHeight - minHeight) / (maxHeight - minHeight), 0.0, 1.0);

      //       //float color1 = diffuseColor.r;
      //       if (normalized_vHeight > 0.0) {
      //         //color1 = 0.0;
      //         //color1 =+ normalized_vHeight * 2.0;
      //         //diffuseColor.rgb = vec3(0.0, (normalized_vHeight - 0.5), 0.0);

      //         diffuseColor.rgb = vec3(normalized_vHeight/2.0, 1.0, 1.0);
      //       }

      //       const vec3 color1 = vec3(0.365, 0.161, 0.31);
      //       const vec3 color2 = vec3(0.678, 0.788, 0.129);

      //     vec3 gradientColor = mix(color1, color2, normalized_vHeight);

      //     diffuseColor.rgb = vec3(gradientColor);
      //       //diffuseColor.rgb = vec3(color1, diffuseColor.g, diffuseColor.b);
      //       `
      // );
    };

    //

    // mat2.onBeforeCompile = function (shader) {
    //   shader.uniforms.time = { value: 0 };

    //   shader.vertexShader = "uniform float time;\n" + shader.vertexShader;
    //   shader.vertexShader = shader.vertexShader.replace(
    //     "#include <begin_vertex>",
    //     [
    //       `float theta = sin( time + position.y ) / 2.0;`,
    //       "float c = cos( theta );",
    //       "float s = sin( theta );",
    //       "mat3 m = mat3( c, 0, s, 0, 1, 0, -s, 0, c );",
    //       "vec3 transformed = vec3( position ) * m;",
    //       "vNormal = vNormal * m;",
    //     ].join("\n")
    //   );

    //   mat2.userData.shader = shader;
    // };

    // mat2.onBeforeCompile = (shader) => {
    //   shader.fragmentShader = shader.fragmentShader.replace(
    //     "#include <common>",
    //     `
    //     #include <common>
    //     `
    //   );
    //   shader.fragmentShader = shader.fragmentShader.replace(
    //     "#include <color_fragment>",
    //     `
    //     #include <color_fragment>
    //     gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
    //     `
    //   );
    // };

    mat2.onBeforeCompile = (shader) => {
      shader.uniforms = Object.assign(shader.uniforms, uniformsForGrid);
      shader.vertexShader = shader.vertexShader.replace(
        "#include <common>",
        `
          uniform sampler2D uFBO;
          uniform sampler2D uFBO2;
          uniform float time;
          uniform vec3 light_color;
          varying vec4 mvPosition;
          varying vec3 vPosition;
          varying vec3 uvHeight;
          varying float vHeight;
          varying float randomNumber;
          varying float rValue;

          attribute vec2 instanceUV;
          attribute float aRandom;
          uniform float rotationAngle;
          uniform float vScale;
          uniform float vScaleRing;
          uniform float overallAnimationLevel;
          uniform float bottom_level;
          uniform float crest;
          uniform float amplitude;
          uniform float start_level;
          uniform float frequency;
          `
      );
      shader.vertexShader = shader.vertexShader.replace(
        "#include <begin_vertex>",
        `
          #include <begin_vertex>

          //float bottom_level = bottom_levelJS;
          //float crest = crestJS;
          //float amplitude = amplitudeJS;
          //float start_level = start_levelJS;
          //float frequency = frequencyJS;

          float angle = rotationAngle * 3.14159265/180.0;
          vec2 pivot = vec2(0.5, 0.4);
          vec2 centeredUV = instanceUV - pivot;

          // Scaling for logo
          float scale = vScale; // Change this to your desired scaling factor
          vec2 scaledUV = centeredUV * scale;

          // Rotation for logo
          vec2 rotatedUV = vec2(
          scaledUV.x * cos(angle) - scaledUV.y * sin(angle),
          scaledUV.x * sin(angle) + scaledUV.y * cos(angle)
          );

          // Scaling for ring
          float scaleRing = vScaleRing; // Change this to your desired scaling factor
          vec2 scaledRingUV = centeredUV * scaleRing;

          // Rotation for ring
          vec2 rotatedRingUV = vec2(
          scaledRingUV.x * cos(angle) - scaledRingUV.y * sin(angle),
          scaledRingUV.x * sin(angle) + scaledRingUV.y * cos(angle)
          );

          vec2 newUV = rotatedUV + pivot;
          vec2 newRingUV = rotatedRingUV + pivot;
          vec4 transition = texture2D(uFBO, newUV);
          vec4 transition2 = texture2D(uFBO2, newRingUV);

          rValue = transition.r;
          //transformed *= transition.g;

          //float vAmplitude = (aRandom + sin(time * frequency * aRandom) + start_level) * transition.g * crest * overallAnimationLevel;
          float vAmplitude = ((sin(time * frequency * aRandom) ) + aRandom + start_level) * transition.g;
          //float vAmplitude =  start_level * transition.g * crest * overallAnimationLevel;
          //float normalized_vAmplitude = clamp((vAmplitude - bottom_level) / (crest - bottom_level), 0.0, crest);
          float normalized_vAmplitude = clamp(vAmplitude, 0.0, crest);

          transformed.y += normalized_vAmplitude;

          vHeight = transformed.y;
          randomNumber = aRandom;
          `
      );
      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <common>",
        `
          #include <common>
          varying vec3 uvHeight;
          varying float vHeight;
          varying float rValue;
          varying vec4 mvPosition;
          varying float randomNumber;
          `
      );
      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <color_fragment>",
        `
          #include <color_fragment>
          // Define the expected range of vHeight values
          const float minHeight = 0.0;
          const float maxHeight = 1.0; // Adjust based on your specific range

          // Normalize vHeight between 0 and 1
          float normalized_vHeight = clamp((vHeight - minHeight) / (maxHeight - minHeight) , 0.05, 0.6);

          //float color1 = diffuseColor.r;

          //diffuseColor.rgb = vec3(normalized_vHeight);

          // diffuseColor.rgb = vec3(normalized_vHeight*randomNumber*0.773/2.0, normalized_vHeight*randomNumber*0.459/2.0, normalized_vHeight*randomNumber*0.969/2.0);

          const vec3 baseColor = vec3(0.867, 0.341, 0.98); //vec3(0.773, 0.459, 0.969);
          diffuseColor.rgb = vec3(normalized_vHeight * randomNumber * baseColor.r/2.0, normalized_vHeight * randomNumber * baseColor.g/2.0, normalized_vHeight * randomNumber * baseColor.b/2.0);

          //const vec3 color2 = vec3(0.678, 0.788, 0.129);
          //const vec3 color1 = vec3(0.365, 0.161, 0.31);

          //vec3 gradientColor = mix(color1, color2, normalized_vHeight);

          //diffuseColor.rgb = vec3(gradientColor);

          // if (normalized_vHeight > 0.0) {
          //   //diffuseColor.rgb = vec3(1.0, 1.0, 1.0);
          //   diffuseColor.rgb = vec3(normalized_vHeight);
          // }
          // if(rValue > 0.0 ){
          //   //diffuseColor.rgb = vec3(0.36, 0.16, 0.30);
          //   diffuseColor.rgb = vec3(clamp(rValue/20.0, 0.0, 1.0));
          // }
          //diffuseColor.rgb = vec3(color1, diffuseColor.g, diffuseColor.b);
          `
      );
    };

    //     instancedMesh1.customDistanceMaterial = new THREE.MeshDepthMaterial({
    //       depthPacking: THREE.RGBADepthPacking,
    //       alphaTest: 0.5,
    //     });
    //     instancedMesh1.customDistanceMaterial.onBeforeCompile = (shader) => {
    //       // app specific instancing shader code
    //       shader.vertexShader =
    //         `#define DEPTH_PACKING 3201
    //             attribute vec3 offset;
    //             attribute vec4 orientation;

    //             vec3 applyQuaternionToVector( vec4 q, vec3 v ){
    //                return v + 2.0 * cross( q.xyz, cross( q.xyz, v ) + q.w * v );
    //             }
    // ` + shader.vertexShader;
    //       shader.vertexShader = shader.vertexShader.replace(
    //         "#include <project_vertex>",
    //         `
    //             vec3 vPosition = applyQuaternionToVector( orientation, transformed );

    //             vec4 mvPosition = modelViewMatrix * vec4( vPosition, 1.0 );
    //             gl_Position = projectionMatrix * modelViewMatrix * vec4( offset + vPosition, 1.0 );`
    //       );

    //       shader.fragmentShader =
    //         "#define DEPTH_PACKING 3201" + "\n" + shader.fragmentShader;
    //     };

    //     instancedMesh1.castShadow = true;
    //     instancedMesh1.receiveShadow = true;

    //     instancedMesh2.customDepthMaterial = new THREE.MeshDepthMaterial({
    //       depthPacking: THREE.RGBADepthPacking,
    //       alphaTest: 0.5,
    //     });
    //     instancedMesh2.customDepthMaterial.onBeforeCompile = (shader) => {
    //       // app specific instancing shader code
    //       shader.vertexShader =
    //         `#define DEPTH_PACKING 3201
    //             attribute vec3 offset;
    //             attribute vec4 orientation;

    //             vec3 applyQuaternionToVector( vec4 q, vec3 v ){
    //                return v + 2.0 * cross( q.xyz, cross( q.xyz, v ) + q.w * v );
    //             }
    // ` + shader.vertexShader;
    //       shader.vertexShader = shader.vertexShader.replace(
    //         "#include <project_vertex>",
    //         `
    //             vec3 vPosition = applyQuaternionToVector( orientation, transformed );

    //             vec4 mvPosition = modelViewMatrix * vec4( vPosition, 1.0 );
    //             gl_Position = projectionMatrix * modelViewMatrix * vec4( offset + vPosition, 1.0 );`
    //       );

    //       shader.fragmentShader =
    //         "#define DEPTH_PACKING 3201" + "\n" + shader.fragmentShader;
    //     };

    //     instancedMesh2.castShadow = true;
    //     instancedMesh2.receiveShadow = true;
  });
}
