/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    // CORS: izinkan localhost saat dev dan domain Vercel saat production
    const allowedOrigin =
      process.env.FRONTEND_URL || "https://kanban-flow-rpl-frontend.vercel.app";

    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin",  value: allowedOrigin },
          { key: "Access-Control-Allow-Methods", value: "GET,POST,PUT,DELETE,OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization" },
        ],
      },
    ];
  },
};

export default nextConfig;