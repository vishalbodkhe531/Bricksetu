import type { NextConfig } from "next";
import withBundleAnalyzer from "@next/bundle-analyzer";

const nextConfig: NextConfig = {
  // Standalone output is only needed for Docker / self-hosting.
  // On Vercel, output: 'standalone' causes ENOENT errors during packaging because Vercel handles serverless tracing natively.
  output: process.env.VERCEL ? undefined : "standalone",
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
