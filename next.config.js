/** @type {import('next').NextConfig} */
const nextConfig = {
  swcMinify: false,
  compiler: {
    // Disable SWC compiler completely
    removeConsole: false,
  },
  webpack: (config, { dev, isServer }) => {
    // Force Babel compilation
    config.resolve.alias = {
      ...config.resolve.alias,
    }
    return config
  },
}

module.exports = nextConfig