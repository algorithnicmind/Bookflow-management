const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '../.env') })

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig
