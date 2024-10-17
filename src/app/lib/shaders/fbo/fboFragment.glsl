uniform float time;
uniform vec4 resolution;
varying vec2 vUv;
uniform float rotationAngle;
uniform float vScale;
uniform float uProgress;

uniform sampler2D step1;
uniform sampler2D step3;
uniform sampler2D step4;
uniform sampler2D step5;
uniform sampler2D step6;
uniform sampler2D step7;
uniform sampler2D step8;
uniform sampler2D step9;
uniform sampler2D step10;

uniform float mt1;
uniform float mt2;
uniform float mt3;
uniform float mt4;
uniform float mt5;
uniform float mt6;

const float PI = 3.14159265;
const float radius = 1.41;
const vec2 pivot = vec2(0.5, 0.5);

void main() {
    // Compute rotation and scaling
    float angle = rotationAngle * PI / 180.0;
    vec2 centeredUV = (vUv - pivot) * vScale;
    vec2 rotatedUV = vec2(
        centeredUV.x * cos(angle) - centeredUV.y * sin(angle),
        centeredUV.x * sin(angle) + centeredUV.y * cos(angle)
    );
    vec2 newUV = rotatedUV + pivot;

    // Fetch all necessary textures
    vec4 color1 = texture2D(step1, newUV);
    vec4 color3 = 1.0 - texture2D(step3, vec2(1.0 - newUV.x, newUV.y));
    vec4 color4 = 1.0 - texture2D(step4, vec2(1.0 - newUV.x, newUV.y));
    vec4 color5 = 1.0 - texture2D(step5, vec2(1.0 - newUV.x, newUV.y));
    vec4 color6 = 1.0 - texture2D(step6, vec2(1.0 - newUV.x, newUV.y));
    vec4 color7 = 1.0 - texture2D(step7, vec2(1.0 - newUV.x, newUV.y));
    vec4 color8 = 1.0 - texture2D(step8, vec2(1.0 - newUV.x, newUV.y));
    vec4 color9 = 1.0 - texture2D(step9, vec2(1.0 - newUV.x, newUV.y));

    // Precompute segment times
    float mTimes[6] = float[6](mt1 + 0.25, mt2 + 0.25, mt3 + 0.25, mt4 + 0.25, mt5 + 0.25, mt6 + 0.25);

    float dist = distance(vUv, vec2(0.5));
    float outer_progress, inner_progress, innerCircle, outerCircle, displacement = 0.0, scale;
    float segmentProgress;

    if (uProgress <= 0.10) {
        segmentProgress = clamp((uProgress - 0.00) / 0.1, 0.0, 1.0);
        outer_progress = clamp(1.1 * segmentProgress, 0.0, 1.0);
        inner_progress = clamp(1.1 * segmentProgress - 0.05, 0.0, 1.0);
        innerCircle = 1.0 - smoothstep((inner_progress - 0.1) * radius, inner_progress * radius, dist);
        outerCircle = 1.0 - smoothstep((outer_progress - 0.1) * radius, inner_progress * radius, dist);
        displacement = outerCircle - innerCircle;
        scale = mix(0.0, color1.r, innerCircle);
    } else if (uProgress <= 0.20) {
        segmentProgress = clamp((uProgress - 0.10) / 0.1, 0.0, 1.0);
        scale = mix(color1.r, 0.0, segmentProgress);  // Replaced color2 with 0.0 (black)
    } else {
        // Iterate through the rest of the progress segments
        vec4 colors[7] = vec4[7](color3, color4, color5, color6, color7, color8, color9);
        for (int i = 0; i < 6; i++) {
            if (uProgress <= mTimes[i]) {
                segmentProgress = clamp((uProgress - (i == 0 ? 0.25 : mTimes[i-1])) / 0.02, 0.0, 1.0);
                scale = mix(colors[i].r, colors[i+1].r, segmentProgress);
                break;
            }
        }
        if (uProgress > mTimes[5]) {
            segmentProgress = clamp((uProgress - mTimes[5]) / 0.02, 0.0, 1.0);
            scale = mix(color9.r, 0.0, segmentProgress);  // Replaced color2 with 0.0 (black)
        }
    }

    // Output the final color with clamped green value
    gl_FragColor = vec4(0.0, clamp(displacement + scale, 0.0, 1.0), 0.0, 1.0);
}
