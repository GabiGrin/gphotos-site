// next.config.js
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/zipzap/static/:path*",
        destination: "https://us-assets.i.posthog.com/static/:path*",
      },
      {
        source: "/zipzap/:path*",
        destination: "https://us.i.posthog.com/:path*",
      },
      {
        source: "/zipzap/decide",
        destination: "https://us.i.posthog.com/decide",
      },
    ];
  },
  // This is required to support PostHog trailing slash API requests
  skipTrailingSlashRedirect: true,
};
module.exports = nextConfig;
