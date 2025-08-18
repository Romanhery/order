import type { NextConfig } from "next";

    /** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // ✅ This ignores ESLint errors on Vercel build
    ignoreDuringBuilds: true,
  },
  typescript: {
    // ✅ This ignores type errors on Vercel build
    ignoreBuildErrors: true,
  },
}

export default nextConfig

