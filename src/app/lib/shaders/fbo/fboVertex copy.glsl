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
varying vec3 vNormal;
varying vec3 vViewPosition;
varying vec3 vNormalPosition;
varying vec2 vUv;
varying vec3 vPosition;
varying vec2 pixels;
float PI = 3.14159265;


void main(){

    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
