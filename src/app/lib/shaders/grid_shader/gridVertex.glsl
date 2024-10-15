uniform sampler2D uFBO;
uniform sampler2D uFBO2;
uniform float time;
uniform vec3 light_color;
uniform float rotationAngle;
uniform float vScale;
uniform float vScaleRing;
uniform float overallAnimationLevel;
uniform float bottom_level;
uniform float crest;
uniform float amplitude;
uniform float start_level;
uniform float frequency;

varying vec4 mvPosition;
varying vec3 vPosition;
varying vec3 uvHeight;
varying float vHeight;
varying float randomNumber;
varying float rValue;

attribute vec2 instanceUV;
attribute float aRandom;

void main(){
          float angle = rotationAngle * 3.14159265/180.0;
          vec2 pivot = vec2(0.5, 0.4);
          vec2 centeredUV = instanceUV - pivot;

          // Scaling
          float scale = vScale; // Change this to your desired scaling factor
          vec2 scaledUV = centeredUV * scale;

          // Rotation
          vec2 rotatedUV = vec2(
          scaledUV.x * cos(angle) - scaledUV.y * sin(angle),
          scaledUV.x * sin(angle) + scaledUV.y * cos(angle)
          );

          vec2 newUV = rotatedUV + pivot;
          vec4 transition = texture2D(uFBO, newUV);

          //float vAmplitude = (aRandom + sin(time * frequency * aRandom ) + start_level) * transition.g * crest * ////overallAnimationLevel / 40.0;
          float vAmplitude = ((sin(time * frequency * aRandom )) + aRandom + start_level) * transition.g;
          //float normalized_vAmplitude = clamp((vAmplitude - bottom_level) / (crest - bottom_level), 0.0, crest);
          float normalized_vAmplitude = clamp(vAmplitude, 0.0, crest);

          //transformed.y += normalized_vAmplitude;

          // Apply displacement to the position's y coordinate
          vec3 displacedPosition = position;
          displacedPosition.y += normalized_vAmplitude;
      
          // Transform the displaced position to clip space
          vec4 modelViewPosition = modelViewMatrix * vec4(displacedPosition, 1.0);
          gl_Position = projectionMatrix * modelViewPosition;
      
          // Set varying variables for the fragment shader
          vPosition = displacedPosition;
          vHeight = displacedPosition.y;

          //vHeight = transformed.y;
}
