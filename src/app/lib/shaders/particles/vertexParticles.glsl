//attribute vec3 position;
uniform float time;
void main() {
    gl_PointSize = 1.5;  // adjust size
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
