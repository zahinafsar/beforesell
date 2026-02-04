import { MetadataRoute } from "next";
import { getBaseUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getBaseUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/dashboard/",
          "/messages/",
          "/login",
          "/register",
          "/forgot-password",
          "/reset-password",
          "/verify",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
