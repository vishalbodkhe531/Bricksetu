import type { NextConfig } from "next";
import withBundleAnalyzer from "@next/bundle-analyzer";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        // Supabase Storage — worker profile pictures
        protocol: 'https',
        hostname: 'bkqumgjimrzrlyvdvuvs.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

/**
 * Bundle analyzer — run with: ANALYZE=true npm run build
 * View the interactive treemap at .next/analyze/client.html
 */
export default withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
})(nextConfig);
