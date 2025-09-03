/** @type {import('next').NextConfig} */
const nextConfig = {
  swcMinify: false,
  experimental: {
    // Force disable SWC completely
    swcFileReading: false,
    swcMinify: false,
    swcLoader: false,
  },
  compiler: {
    removeConsole: false,
  },
  webpack: (config, { dev, isServer }) => {
    // Force Babel loader for all JS/TS files
    config.module.rules.push({
      test: /\.(js|jsx|ts|tsx)$/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['next/babel'],
        },
      },
    })
    
    // Completely disable SWC
    config.resolve.alias = {
      ...config.resolve.alias,
      '@next/swc-linux-x64-gnu': false,
      '@next/swc-linux-x64-musl': false,
    }
    
    return config
  },
  env: {
    // Force disable SWC at environment level
    NEXT_DISABLE_SWC: 'true',
  },
}

module.exports = nextConfig