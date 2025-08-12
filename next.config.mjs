/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configure external packages for serverless deployment (fixes PDF processing)
  serverExternalPackages: ['pdf-parse'],
  // Configure experimental features for large file uploads
  experimental: {
    // Disable ISR memory cache to save memory for uploads
    staleTimes: {
      dynamic: 0,
      static: 0,
    },
  },
  // Security: Enable ESLint checks during builds to catch potential issues
  eslint: {
    ignoreDuringBuilds: false,
    // Only run ESLint on specific directories to avoid external dependencies
    dirs: ['app', 'components', 'lib', 'hooks', 'contexts']
  },
  webpack: (config, { dev, isServer }) => {
    // Remove console.log statements in production builds
    if (!dev && !isServer) {
      config.optimization.minimizer.forEach((minimizer) => {
        if (minimizer.constructor.name === 'TerserPlugin') {
          minimizer.options.terserOptions.compress.drop_console = true
        }
      })
    }
    return config
  },
  // Security: Enable TypeScript checks during builds for better type safety
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    unoptimized: true,
  },
  // Security: Add security headers
  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload'
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; media-src 'self' https://*.public.blob.vercel-storage.com blob: data:; connect-src 'self' https:; font-src 'self' data:; upgrade-insecure-requests;"
          },
          {
            key: 'Expect-CT',
            value: 'max-age=86400, enforce'
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin'
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'unsafe-none'
          },
          {
            key: 'Permissions-Policy',
            value: 'geolocation=(), microphone=(), camera=(), payment=()'
          }
        ]
      }
    ]
  }
}

export default nextConfig
