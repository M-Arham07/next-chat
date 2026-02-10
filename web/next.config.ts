import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript:{
    ignoreBuildErrors:true
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https', // Enforces HTTPS protocol for all images
        hostname: '**',     // Allows any hostname
      },
    ],
  },
  transpilePackages:["@chat/shared"]
};

export default nextConfig;
