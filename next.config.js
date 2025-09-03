/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: false,
  compiler: {
    removeConsole: false,
  },
  experimental: {
    esmExternals: false,
  }
}

module.exports = nextConfig