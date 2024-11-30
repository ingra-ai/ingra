/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
  ],
  sassOptions: {
    silenceDeprecations: ['legacy-js-api'],
  },
};

export default nextConfig;
