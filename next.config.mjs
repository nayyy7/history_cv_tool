/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
  assetPrefix: "./",
  // Windows 外置盘上 webpack realpath/readlink 会 EISDIR，关掉缓存与 symlink 解析
  webpack: (config) => {
    config.resolve.symlinks = false;
    config.cache = false;
    config.snapshot = {
      managedPaths: [],
      immutablePaths: [],
    };
    return config;
  },
};

export default nextConfig;
