import * as THREE from "three";
import vertexParticles from "../shaders/particles/vertexParticles.glsl";
import fragmentParticles from "../shaders/particles/fragmentParticles.glsl";

export default class Stars {
  constructor(scene, count, radius) {
    this.scene = scene;
    this.count = count;
    this.radius = radius;

    //
    this.positions = this.generatePositions();
    this.setUpParticles(this.positions);
  }
  generatePositions() {
    const positions = new Float32Array(this.count * 3);

    for (let i = 0; i < this.count; i++) {
      // Random spherical coordinates
      const u = Math.random(); // 0 → 1
      const v = Math.random(); // 0 → 1
      const theta = 2 * Math.PI * u; // azimuth
      const phi = Math.acos(2 * v - 1); // polar
      const r = this.radius; //* Math.sqrt(Math.random()); // bias towards outer shell

      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
    }

    return positions;
  }
  setUpParticles(positions) {
    let geometry = new THREE.BufferGeometry();

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    this.material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
      },
      vertexShader: vertexParticles,
      fragmentShader: fragmentParticles,
    });

    const points = new THREE.Points(geometry, this.material);
    this.scene.add(points);
  }
}
