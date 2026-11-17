import type { NextConfig } from "next"

const devOrigins = (process.env.ALLOWED_DEV_ORIGINS ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean)

const nextConfig: NextConfig = {
  // Origin tambahan untuk `next dev` (mis. ponsel di LAN). Dari env supaya
  // alamat IP lokal tidak hardcoded di repo.
  allowedDevOrigins: devOrigins.length > 0 ? devOrigins : undefined,
  async headers() {
    // Content-Security-Policy dipasang di proxy.ts (butuh nonce per request).
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "X-DNS-Prefetch-Control", value: "on" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ]
  },
}

export default nextConfig
