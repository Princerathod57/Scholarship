/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  // Suppress hydration warnings from browser extensions
  reactStrictMode: true,
  experimental: {
    // This helps with hydration issues
    suppressHydrationWarning: true,
  },
  
  // Security headers for production
  async headers() {
    const isProduction = process.env.NODE_ENV === 'production';
    
    if (!isProduction) {
      return [];
    }
    
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
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
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https:",
              "font-src 'self'",
              "connect-src 'self' https:",
              "frame-ancestors 'none'"
            ].join('; ')
          }
        ],
      },
    ];
  },
  webpack: (config, { isServer }) => {
    config.cache = false;
    
    // Handle Firebase Admin SDK and Node.js modules
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        path: false,
        os: false,
        stream: false,
        assert: false,
        url: false,
        util: false,
        child_process: false,
      };
      
      // Exclude firebase-admin from client bundle
      config.externals = config.externals || [];
      config.externals.push('firebase-admin');
    }
    
    return config;
  },
};
 
module.exports = nextConfig;