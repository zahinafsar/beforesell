import type { NextConfig } from "next";
import { nextTsApi } from "next-ts-api/config";

const withNextTsApi = nextTsApi({
  outDir: "types",
  outFile: "api.ts",
});

const nextConfig: NextConfig = {
  images: {
    domains: ["res.cloudinary.com"],
  },
};

export default withNextTsApi(nextConfig);
