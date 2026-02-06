import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript:{
    ignoreBuildErrors:true
  },
  transpilePackages:["@chat/shared"]
};

export default nextConfig;
