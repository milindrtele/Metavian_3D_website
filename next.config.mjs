/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  webpack: (config) => {
    // Shaders
    config.module.rules.push({
      test: /\.(glsl|vs|fs|vert|frag)$/i,
      use: ["raw-loader", "glslify-loader"],
    });

    // GLB / GLTF models
    config.module.rules.push({
      test: /\.(glb|gltf)$/i,
      type: "asset/resource",
    });

    // hdri files
    config.module.rules.push({
      test: /\.(hdr)$/i,
      type: "asset/resource",
    });

    //ttf fonts
    config.module.rules.push({
      test: /\.(ttf)$/i,
      type: "asset/resource",
    });

    return config;
  },
};

export default nextConfig;
