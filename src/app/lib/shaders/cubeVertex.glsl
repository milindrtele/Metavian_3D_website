uniform float time;
varying vec2 vUv;
varying vec3 vPosition;
varying vec2 pixels;
float PI = 3.14159265;
attribute float aRandom;

void main(){
    vUv = uv;

    vec4 mvPosition = modelMatrix * instanceMatrix * vec4(position, 1.0);

    mvPosition.y += (aRandom + sin(time + 15.0 * aRandom))/2.0;

    mvPosition = viewMatrix * mvPosition;

    gl_Position = projectionMatrix * mvPosition;
}
