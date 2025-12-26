import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/spatify",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
