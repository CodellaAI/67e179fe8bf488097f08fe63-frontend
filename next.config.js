
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['ui-avatars.com'],
  },
  webpack: (config) => {
    config.externals.push({
      "utf-8-validate": "commonjs utf-8-validate",
      bufferutil: "commonjs bufferutil"
    });
    return config;
  },
}

if (process.env.NEXT_PUBLIC_API_URL) {
  try {
    // Extract just the hostname part
    const hostname = process.env.NEXT_PUBLIC_API_URL.replace(/^https?:\/\//, '').split('/')[0];
    if (!nextConfig.images.domains.includes(hostname)) {
      nextConfig.images.domains.push(hostname);
    }
  } catch (error) {
    console.warn(`Error adding API domain to images`);
  }
}

module.exports = nextConfig
