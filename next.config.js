/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['nesbrgmtxtpgkkqgjukv.supabase.co'],
  },
  experimental: {
    serverActions: true,
  },
}

module.exports = nextConfig