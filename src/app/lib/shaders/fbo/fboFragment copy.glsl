uniform float time;
uniform vec4 resolution;
varying vec2 vUv;
varying vec3 vPosition;
float PI = 3.14159265;
uniform float rotationAngle;
uniform float vScale;
uniform float uProgress;
uniform sampler2D step1;
uniform sampler2D step2;
uniform sampler2D step3;
uniform sampler2D step4;
uniform sampler2D step5;
uniform sampler2D step6;
uniform sampler2D step7;
uniform sampler2D step8;

void main() {
    
    float angle = rotationAngle * 3.14159265/180.0;
    vec2 pivot = vec2(0.5, 0.5); 
    vec2 centeredUV = vUv - pivot;
          
    // Scaling
    float scaleUV = vScale; // Change this to your desired scaling factor
    vec2 scaledUV = centeredUV * scaleUV;
    
    // Rotation
    vec2 rotatedUV = vec2(
    scaledUV.x * cos(angle) - scaledUV.y * sin(angle),
    scaledUV.x * sin(angle) + scaledUV.y * cos(angle)
    );

    vec2 newUV = rotatedUV + pivot;
    vec4 color1 = texture2D(step1, vec2(newUV.x, newUV.y));
    vec4 color2 = texture2D(step2, vec2(newUV.x, newUV.y));
    vec4 color3 = texture2D(step3, vec2(newUV.x, newUV.y));
    vec4 color4 = texture2D(step4, vec2(newUV.x, newUV.y));
    vec4 color5 = texture2D(step5, vec2(newUV.x, newUV.y));
    vec4 color6 = texture2D(step6, vec2(newUV.x, newUV.y));
    vec4 color7 = texture2D(step7, vec2(newUV.x, newUV.y));
    vec4 color8 = texture2D(step8, vec2(newUV.x, newUV.y));
    color4 = 1.0-color4;
    color5 = 1.0-color5;
    color6 = 1.0-color6;
    color7 = 1.0-color7;
    color8 = 1.0-color8;

    float a = 0.2;

    //vec4 color1 = vec4(1.0, 0.0, 0.0, 1.0); // Red
    //vec4 color2 = vec4(0.0, 0.0, 1.0, 1.0); // Blue

    float dist = distance(vUv, vec2(0.5));
    float radius = 1.41;
    //float outer_progress = clamp(1.1*uProgress, 0.0, 1.0);
    //float inner_progress = clamp(1.1*uProgress - 0.05, 0.0, 1.0);

    //float innerCircle = 1.0 - smoothstep((inner_progress-0.1)*radius, inner_progress*radius, dist);

    //float outerCircle = 1.0 - smoothstep((outer_progress-0.1)*radius, inner_progress*radius, dist);

    //float displacement = outerCircle - innerCircle;

    float outer_progress = 0.0;
    float inner_progress = 0.0;

    float innerCircle = 0.0;
    float outerCircle = 0.0;
    float displacement = 0.0;

    float scale = 0.0;
    if(uProgress <= 0.5){

        outer_progress = clamp(1.1*uProgress, 0.0, 1.0);
        inner_progress = clamp(1.1*uProgress - 0.05, 0.0, 1.0);
        innerCircle = 1.0 - smoothstep((inner_progress-0.1)*radius, inner_progress*radius, dist);
        outerCircle = 1.0 - smoothstep((outer_progress-0.1)*radius, inner_progress*radius, dist);
        displacement = outerCircle - innerCircle;
        scale = mix(0.0, color1.r, innerCircle); //color2.r
    }else if(uProgress <= 0.75){
        
        outer_progress = clamp(1.1*(uProgress-0.5)*2.0, 0.0, 1.0);
        inner_progress = clamp(1.1*(uProgress-0.5)*2.0 - 0.05, 0.0, 1.0);
        innerCircle = 1.0 - smoothstep((inner_progress-0.1)*radius, inner_progress*radius, dist);
        outerCircle = 1.0 - smoothstep((outer_progress-0.1)*radius, inner_progress*radius, dist);
        displacement = outerCircle - innerCircle;
        scale = mix(color1.r, color6.r, innerCircle);
    }else{
        //outer_progress = clamp(1.1*(uProgress-0.75), 0.0, 1.0);
        //inner_progress = clamp(1.1*(uProgress-0.75) - 0.05, 0.0, 1.0);
        //innerCircle = 1.0 - smoothstep((inner_progress-0.1)*radius, inner_progress*radius, dist);
        //outerCircle = 1.0 - smoothstep((outer_progress-0.1)*radius, inner_progress*radius, dist);
        //displacement = outerCircle - innerCircle;
        scale = mix(color6.r, color8.r, (uProgress-0.75)*4.0);
    }
    

    float clampedProgress = clamp(uProgress, 0.0, 1.0);
    vec4 finalColor = mix(color1, color2, clampedProgress);

    float clampedGreen = clamp(displacement+scale, 0.0, 1.0);

    //vec4 finalColor = mix(vec4(1.0), vec4(vec3(0.0), 1.0), uProgress);
    //gl_FragColor = vec4(a,a,a, 1.0);
    //gl_FragColor = vec4(vec3(outerCircle - innerCircle), 1.0);
    //gl_FragColor = vec4(color1.r * uProgress, color1.g * uProgress, color1.b * uProgress, 1.0);
    //gl_FragColor = finalColor;

    gl_FragColor = vec4(vec3(0.0, clampedGreen, 0.0), 1.0);
    
}
