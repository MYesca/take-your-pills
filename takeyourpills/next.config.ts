import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Prisma client needs to be externalized for proper build handling
  serverExternalPackages: ['@prisma/client'],
};

export default nextConfig;
