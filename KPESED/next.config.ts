import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  allowedDevOrigins: ["3000-ixitgifzor7v8xu8io86z-7ef9e15f.us4.manus.computer"],
  async headers() {
    return [
      { source: "/", headers: [{ key: "X-Robots-Tag", value: "index, follow" }] },
      { source: "/api/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }] },
    ]
  },
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
};

export default nextConfig;
