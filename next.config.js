/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['nesbrgmtxtpgkkqgjukv.supabase.co'],
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', 'happy-split.vercel.app']
    }
  },
}

module.exports = nextConfig