uniform float time;

float rand(vec2 co){
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

void main() {
    float seed = rand(gl_PointCoord); // random seed per point
    float intensity = 0.5 + 0.5 * sin(time * 3.0 + seed * 6.28);
    gl_FragColor = vec4(vec3(intensity), 1.0);
}
