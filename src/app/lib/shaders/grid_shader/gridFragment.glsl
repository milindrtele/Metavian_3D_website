varying vec3 uvHeight;
varying float vHeight;
varying float rValue;
varying vec4 mvPosition;
varying float randomNumber;

void main() {
    // Define the expected range of vHeight values
    const float minHeight = 0.0;
    const float maxHeight = 1.0; // Adjust based on your specific range
    
    // Normalize vHeight between 0 and 1
    float normalized_vHeight = clamp((vHeight - minHeight) / (maxHeight - minHeight), 0.05, 0.6);
    
    // Calculate the RGB color based on normalized_vHeight and randomNumber
    vec3 color = vec3(
        normalized_vHeight * randomNumber * 0.773 / 2.0,
        normalized_vHeight * randomNumber * 0.459 / 2.0,
        normalized_vHeight * randomNumber * 0.969 / 2.0
    );
    
    // Output the final color to the fragment shader
    //gl_FragColor = vec4(color, 1.0); // Set alpha to 1.0 for full opacity
    gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
}
