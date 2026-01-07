/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // Configuration pour hot reload sous Windows avec Docker
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      }
    }
    return config
  },
}

module.exports = nextConfig
