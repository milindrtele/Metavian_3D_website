import * as THREE from "three";

const setupRaycaster = (scene, camera, onIntersectsUpdate) => {
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();

  function onMouseClick(event) {
    // calculate pointer position in normalized device coordinates
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // update the picking ray with the camera and pointer position
    raycaster.setFromCamera(pointer, camera);

    // calculate objects intersecting the picking ray
    const intersects = raycaster.intersectObjects(scene.children);

    // Call the callback function with the intersects array
    if (onIntersectsUpdate) {
      onIntersectsUpdate(intersects);
    }
  }

  window.addEventListener("click", onMouseClick);
};

export { setupRaycaster };
