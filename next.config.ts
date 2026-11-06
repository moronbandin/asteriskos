import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Os ficheiros de gramática (content/) lense no servidor
  outputFileTracingIncludes: { "/gramatica/**": ["./content/**/*"] },
};

export default nextConfig;
