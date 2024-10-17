uniform float time;
uniform vec4 resolution;
varying vec2 vUv;
varying vec3 vPosition;
float PI = 3.14159265;
uniform float rotationAngle;
uniform float vScale;
uniform float uProgress;

uniform sampler2D step1; //metavian-logo

uniform sampler2D step3; //islands_02.jpg
uniform sampler2D step4; //01.jpg
uniform sampler2D step5; //02.jpg
uniform sampler2D step6; //03.jpg
uniform sampler2D step7; //04.jpg
uniform sampler2D step8; //05.jpg
uniform sampler2D step9; //06.jpg
uniform sampler2D step10; //06.jpg

uniform float mt1;
uniform float mt2;
uniform float mt3;
uniform float mt4;
uniform float mt5;
uniform float mt6;

void main() {

    float mTime1 = mt1 + 0.25;
    float mTime2 = mt2 + 0.25;
    float mTime3 = mt3 + 0.25;
    float mTime4 = mt4 + 0.25;
    float mTime5 = mt5 + 0.25;
    float mTime6 = mt6 + 0.25;

    float angle = rotationAngle * PI / 180.0;
    vec2 pivot = vec2(0.5, 0.5); 
    vec2 centeredUV = vUv - pivot;
    
    // Scale and rotate UV
    vec2 scaledUV = centeredUV * vScale;
    vec2 rotatedUV = vec2(
        scaledUV.x * cos(angle) - scaledUV.y * sin(angle),
        scaledUV.x * sin(angle) + scaledUV.y * cos(angle)
    );
    vec2 newUV = rotatedUV + pivot;

    // Fetch textures
    vec4 color1 = texture2D(step1, newUV); //metavian-logo
    vec4 color2 = vec4(0.0); // all black
    vec4 color3 = 1.0 - texture2D(step3, vec2(1.0 - newUV.x, newUV.y));  //islands_02.jpg
    vec4 color4 = 1.0 - texture2D(step4, vec2(1.0 - newUV.x, newUV.y));  //01.jpg
    vec4 color5 = 1.0 - texture2D(step5, vec2(1.0 - newUV.x, newUV.y));  //02.jpg
    vec4 color6 = 1.0 - texture2D(step6, vec2(1.0 - newUV.x, newUV.y));  //03.jpg
    vec4 color7 = 1.0 - texture2D(step7, vec2(1.0 - newUV.x, newUV.y));  //04.jpg
    vec4 color8 = 1.0 - texture2D(step8, vec2(1.0 - newUV.x, newUV.y));  //05.jpg
    vec4 color9 = 1.0 - texture2D(step9, vec2(1.0 - newUV.x, newUV.y));  //06.jpg
    vec4 color10 = 1.0 - texture2D(step10, vec2(1.0 - newUV.x, newUV.y));  //06.jpg

    float dist = distance(vUv, vec2(0.5));
    float radius = 1.41;
    float outer_progress, inner_progress, innerCircle, outerCircle, displacement, scale;
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
        outer_progress = clamp(1.1 * segmentProgress, 0.0, 1.0);
        inner_progress = clamp(1.1 * segmentProgress - 0.05, 0.0, 1.0);
        innerCircle = 1.0 - smoothstep((inner_progress - 0.1) * radius, inner_progress * radius, dist);
        outerCircle = 1.0 - smoothstep((outer_progress - 0.1) * radius, inner_progress * radius, dist);
        displacement = outerCircle - innerCircle;
        scale = mix(color1.r, color2.r, innerCircle);
    } else if (uProgress <= 0.25) {
        segmentProgress = clamp((uProgress - 0.20) / 0.02, 0.0, 1.0);
        displacement = 0.0;
        scale = mix(color2.r, color3.r, segmentProgress);
    } else if (uProgress <= (mTime1-0.05)) {
        segmentProgress = clamp((uProgress - 0.25) / 0.02, 0.0, 1.0);
        displacement = 0.0;
        scale = mix(color3.r, color4.r, segmentProgress);
    } else if (uProgress <= mTime2) {
        segmentProgress = clamp((uProgress - mTime1) / 0.02, 0.0, 1.0);
        displacement = 0.0;
        scale = mix(color4.r, color5.r, segmentProgress);
    } else if (uProgress <= mTime3) {
        segmentProgress = clamp((uProgress - mTime2) / 0.02, 0.0, 1.0);
        displacement = 0.0;
        scale = mix(color5.r, color6.r, segmentProgress);
    } else if (uProgress <= mTime4) {
        segmentProgress = clamp((uProgress - mTime3) / 0.02, 0.0, 1.0);
        displacement = 0.0;
        scale = mix(color6.r, color7.r, segmentProgress);
    } else if (uProgress <= mTime5) {
        segmentProgress = clamp((uProgress - mTime4) / 0.02, 0.0, 1.0);
        displacement = 0.0;
        scale = mix(color7.r, color8.r, segmentProgress);
    } else if (uProgress <= mTime6) {
        segmentProgress = clamp((uProgress - mTime5) / 0.02, 0.0, 1.0);
        displacement = 0.0;
        scale = mix(color8.r, color9.r, segmentProgress);
    } else {
        segmentProgress = clamp((uProgress - mTime6) / 0.02, 0.0, 1.0);
        displacement = 0.0;
        scale = mix(color9.r, color2.r, segmentProgress);
    }

    float clampedGreen = clamp(displacement + scale, 0.0, 1.0);
    gl_FragColor = vec4(0.0, clampedGreen, 0.0, 1.0);
}
