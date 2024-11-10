/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['lucide-react'],
  pageExtensions: ["js", "jsx", "ts", "tsx", "md", "mdx"],
  redirects: async () => {
    return [
      {
        source: '/marketplace',
        destination: '/marketplace/collections',
        permanent: false,
      }
    ];
  },
  headers: async () => {
    return [
      {
        // Cache all images and fonts
        source: '/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ],
      },
      {
        source: "/api/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "*", // Set your origin
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, PATCH, PUT, DELETE, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization, X-API-KEY",
          },
        ],
      },
      {
        source: "/(.*)",
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'same-origin'
          },
          {
            key: 'Content-Security-Policy',
            value: `
              default-src 'self'; 
              base-uri 'self'; 
              script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://*.hotjar.com; 
              style-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://*.hotjar.com; 
              img-src 'self' data: https://cdn.jsdelivr.net https://*.hotjar.com; 
              connect-src 'self' https://cdn.jsdelivr.net https://*.hotjar.com https://*.hotjar.io wss://*.hotjar.com; 
              font-src 'self' https://cdn.jsdelivr.net https://*.hotjar.com; 
              frame-ancestors 'none'; 
              form-action 'self'; 
              upgrade-insecure-requests;
              worker-src 'self' blob:;
            `.replace(/\s+/g, ' ').replace(/\n/g, ' ').trim()
          }
        ]
      }
    ];
  },
  images: {
  }
};


export default nextConfig;
