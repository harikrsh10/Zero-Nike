import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    // The project folder (one level up) holds the size and stock JSON the page reads.
    root: path.join(__dirname, ".."),
  },
};

export default nextConfig;
