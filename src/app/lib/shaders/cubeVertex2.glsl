uniform float time;
varying vec3 vNormal;
varying vec3 vViewPosition;
varying vec3 vNormalPosition;
varying vec2 vUv;
varying vec3 vPosition;
varying vec2 pixels;
float PI = 3.14159265;
uniform float aRandom;

void main(){
    vUv = uv;

    vec4 mvPosition = modelMatrix *  vec4(position, 1.0);

    mvPosition.y += (aRandom + sin(time/2.0 * 12.0 * aRandom) / 2.0);

    vNormal = normalMatrix * normal;
    vViewPosition = mvPosition.xyz;
    
    mvPosition = mvPosition;

    gl_Position = projectionMatrix * viewMatrix * mvPosition;
}
