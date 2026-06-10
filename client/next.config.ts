import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
  },
  // Allow hot-reloading when accessed from network IP (WSL / Port Forwarding)
  allowedDevOrigins: ['172.24.235.64']
};

export default nextConfig;
