uniform float time;
uniform float progress;
uniform vec4 resolution;
varying vec2 vUv;
varying vec3 vPosition;
float PI = 3.14159265;
void main(){
    gl_FragColor = vec4(vUv, 0.0, 1.0);

}