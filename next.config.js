/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "395z4m7f-8080.asse.devtunnels.ms",
        port: "",
        pathname: "/uploads/**",
      },
       {
        protocol: "https",
        hostname: "beasjqzoohaxzldbbhlq.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "papiverse-app-o63sp.ondigitalocean.app",
        port: "",
        pathname: "/uploads/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "8080",
        pathname: "/uploads/**",
      },
      // Localhost HTTPS (if ever used)
      {
        protocol: "https",
        hostname: "localhost",
        port: "8080",
        pathname: "/uploads/**",
      },
    ],
  },
};

export default nextConfig;
