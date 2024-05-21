/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['lucide-react'], // add this
  images: {
    domains: [
      "ui-avatars.com"
    ]
  }
};

export default nextConfig;
