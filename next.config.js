/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: false,
  compiler: {
    removeConsole: false,
  },
  experimental: {
    esmExternals: 'loose',
  },
  webpack: (config, { isServer }) => {
    // Completely disable SWC loader
    config.module.rules = config.module.rules.map(rule => {
      if (rule.use && rule.use.loader && rule.use.loader.includes('next-swc-loader')) {
        rule.use.loader = 'babel-loader'
        rule.use.options = {
          presets: ['next/babel']
        }
      }
      return rule
    })
    
    return config
  }
}

module.exports = nextConfig