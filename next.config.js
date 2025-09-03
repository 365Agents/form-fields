/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable SWC minification
  swcMinify: false,
  
  // Compiler configuration
  compiler: {
    removeConsole: false,
  },
  
  // Environment variables to disable SWC
  env: {
    NEXT_DISABLE_SWC: 'true',
  },
  
  // Webpack configuration to force Babel
  webpack: (config, { dev, isServer }) => {
    // Add Babel loader for JS/TS files
    config.module.rules.push({
      test: /\.(js|jsx|ts|tsx)$/,
      exclude: /node_modules/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['next/babel'],
        },
      },
    });
    
    return config;
  },
}

module.exports = nextConfig