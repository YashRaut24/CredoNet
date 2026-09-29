/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  webpack: (config, { dev }) => {
    config.externals.push("pino-pretty", "lokijs", "encoding");
    if (dev) {
      config.cache = false;
    }
    return config;
  },
};

export default nextConfig;
