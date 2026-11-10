/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      { source: '/api/:path*', destination: 'http://localhost:3001/api/:path*' },
      { source: '/store/:path*', destination: 'http://localhost:3001/store/:path*' },
    ];
  },
};

export default nextConfig;

