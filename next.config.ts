import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Tailwind CSS v4: processa os arquivos .css pelo loader oficial do Turbopack.
  // NÃO remover — sem esta regra o site fica sem estilos.
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
