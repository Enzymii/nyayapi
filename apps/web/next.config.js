module.exports = {
  reactStrictMode: true,
  transpilePackages: ["ui"],
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:4399/:path*' // Proxy to Backend
      }
    ];
  }
};
