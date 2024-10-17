

varying vec2 vUv;

void main() {
    vec2 vUv = uv; // Pass UV coordinates to the fragment shader
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPosition;
}
