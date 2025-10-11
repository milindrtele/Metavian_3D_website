uniform float time;
uniform vec4 lineColor;
uniform float speed;
uniform float frequency;
uniform float thickness;

varying vec2 vUv;

void main() {
    // Move UV vertically over time
    float movingY = mod(vUv.y + time * -speed, 1.0);

    // Create repeating horizontal lines
    float lines = sin(movingY * frequency * 3.14159265 * 2.0);

    // Convert to a sharp pattern
    float mask = smoothstep(1.0 - thickness, 1.0, lines);

    // Base background color
    vec4 background = vec4(0.0);

    // Mix line color and background
    vec4 color = mix(background, lineColor, mask);

    gl_FragColor = vec4(color);
}
