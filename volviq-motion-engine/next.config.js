const nextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ["@remotion/bundler", "@remotion/renderer", "esbuild"],
  // Turbopack config for Next.js 16+
  turbopack: {
    rules: {
      "*.md": {
        loaders: ["raw-loader"],
        as: "*.js",
      },
    },
  },
  // Webpack config for fallback
  webpack: (config) => {
    config.module.rules.push({
      test: /\.md$/,
      type: "asset/source",
    });
    return config;
  },
  // CORS Headers for APIs
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" }, // Allows all origins in local dev & prod
          { key: "Access-Control-Allow-Methods", value: "GET,OPTIONS,PATCH,DELETE,POST,PUT" },
          { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization" },
        ],
      },
    ];
  },
  // Local aliases bypass any permanent redirects cached by browsers from older
  // versions of this project while still serving the same bundled pages.
  async rewrites() {
    if (process.env.NODE_ENV === "production") return [];
    return [
      { source: "/auth/login", destination: "/login" },
      { source: "/auth/signup", destination: "/signup" },
      { source: "/auth/onboarding", destination: "/onboarding" },
      { source: "/auth/request-access", destination: "/request-access" },
    ];
  },
  // Keep the bundled auth pages local during development. Production may hand
  // these routes to the public website, but a permanent redirect here poisons
  // the browser cache for localhost as well.
  async redirects() {
    if (process.env.NODE_ENV !== "production") {
      return [];
    }

    return [
      {
        source: "/login",
        destination: "https://volviq.xyz/login",
        permanent: false,
      },
      {
        source: "/signup",
        destination: "https://volviq.xyz/signup",
        permanent: false,
      },
      {
        source: "/onboarding",
        destination: "https://volviq.xyz/onboarding",
        permanent: false,
      },
      {
        source: "/request-access",
        destination: "https://volviq.xyz/request-access",
        permanent: false,
      },
    ];
  },
};

module.exports = nextConfig;
