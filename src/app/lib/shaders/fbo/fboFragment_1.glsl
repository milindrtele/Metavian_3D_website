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

void main() {
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

    if (uProgress <= 0.10) {  ///////////////////start with black and blow in the metavian logo
        outer_progress = clamp(1.1 * uProgress*10.0, 0.0, 1.0);
        inner_progress = clamp(1.1 * uProgress*10.0 - 0.05, 0.0, 1.0);
        innerCircle = 1.0 - smoothstep((inner_progress - 0.1) * radius, inner_progress * radius, dist);
        outerCircle = 1.0 - smoothstep((outer_progress - 0.1) * radius, inner_progress * radius, dist);
        displacement = outerCircle - innerCircle;
        scale = mix(0.0, color1.r, innerCircle);
    } else if (uProgress <= 0.2) { ///////////////////blow out the metavian logo into the black image
        outer_progress = clamp(1.1 * (uProgress - 0.1) * 10.0, 0.0, 1.0);
        inner_progress = clamp(1.1 * (uProgress - 0.1) * 10.0 - 0.05, 0.0, 1.0);
        innerCircle = 1.0 - smoothstep((inner_progress - 0.1) * radius, inner_progress * radius, dist);
        outerCircle = 1.0 - smoothstep((outer_progress - 0.1) * radius, inner_progress * radius, dist);
        displacement = outerCircle - innerCircle;
        scale = mix(color1.r, color2.r, innerCircle);
    } else if (uProgress <= 0.3){ ///////////////////start with black and popup islands
        //outer_progress = clamp(1.1 * (uProgress - 0.2) * 10.0, 0.0, 1.0);
        //inner_progress = clamp(1.1 * (uProgress - 0.2) * 10.0 - 0.05, 0.0, 1.0);
        //innerCircle = 1.0 - smoothstep((inner_progress - 0.1) * radius, inner_progress * radius, dist);
        //outerCircle = 1.0 - smoothstep((outer_progress - 0.1) * radius, inner_progress * radius, dist);
        //displacement = outerCircle - innerCircle;
        displacement = 0.0;
        scale = mix(color2.r, color3.r, (uProgress - 0.2) * 10.0);
    } else if (uProgress <= 0.4){
        displacement = 0.0;
        scale = mix(color3.r, color4.r, (uProgress - 0.3) * 10.0);
    } else if (uProgress <= 0.5){
        displacement = 0.0;
        scale = mix(color4.r, color5.r, (uProgress - 0.4) * 10.0);
    } else if (uProgress <= 0.6){
        displacement = 0.0;
        scale = mix(color5.r, color6.r, (uProgress - 0.5) * 10.0);
    } else if (uProgress <= 0.7){
        displacement = 0.0;
        scale = mix(color6.r, color7.r, (uProgress - 0.6) * 10.0);
    } else if (uProgress <= 0.8){
        displacement = 0.0;
        scale = mix(color7.r, color8.r, (uProgress - 0.7) * 10.0);
    }else if (uProgress <= 0.9){
        displacement = 0.0;
        scale = mix(color8.r, color9.r, (uProgress - 0.8) * 10.0);
    } else{
        displacement = 0.0;
        scale = mix(color9.r, color2.r, (uProgress - 0.9) * 10.0);
    }

    float clampedGreen = clamp(displacement + scale, 0.0, 1.0);
    gl_FragColor = vec4(0.0, clampedGreen, 0.0, 1.0);
}
