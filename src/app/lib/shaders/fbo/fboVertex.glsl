uniform float time;
uniform float aRandom;
uniform float uProgress;
uniform float rotationAngle;
uniform float vScale;
uniform sampler2D step1;
uniform sampler2D step2;
uniform sampler2D step3;
uniform sampler2D step4;
uniform sampler2D step5;
uniform sampler2D step6;
uniform sampler2D step7;
uniform sampler2D step8;
uniform sampler2D step9;
varying vec3 vNormal;
varying vec3 vViewPosition;
varying vec3 vNormalPosition;
varying vec2 vUv;
varying vec3 vPosition;
varying vec2 pixels;
float PI = 3.14159265;

uniform float mt1;
uniform float mt2;
uniform float mt3;
uniform float mt4;
uniform float mt5;
uniform float mt6;

void main() {
    vUv = uv;
    vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
    vNormal = normalize(normalMatrix * normal);

    // View position for fragment shader
    vViewPosition = (modelMatrix * vec4(position, 1.0)).xyz;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
