varying vec3 vNormal; // Interpolated normal from vertex shader
varying vec3 vViewPosition; // Interpolated view position from vertex shader
varying vec2 vUv; // Texture coordinates from vertex shader

uniform sampler2D matcapTexture; // Matcap texture

void main()
{
    // Normalize the normal
    vec3 viewNormal = normalize(vNormal);

    // Calculate reflection vector
    vec3 R = reflect(-normalize(vViewPosition), viewNormal);
    float m = 2.0 * sqrt(
        pow(R.x, 2.0) +
        pow(R.y, 2.0) +
        pow(R.z + 1.0, 2.0)
    );
    vec2 matcapUV = R.xy / m + 0.5;

    // Sample matcap texture
    vec4 matcapColor = texture2D(matcapTexture, matcapUV);

    gl_FragColor = matcapColor;
}
