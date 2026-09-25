import { MetadataRoute } from "next";
import { getBaseUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getBaseUrl();
  const disallow = [
    "/api/",
    "/admin",
    "/dashboard",
    "/messages",
    "/favorites",
    "/promotions/",
    "/listings/new",
    "/requests/new",
    "/listings/*/boost",
    "/survey",
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/verify",
  ];

  return {
    rules: [
      { userAgent: "*", allow: "/", disallow },
      { userAgent: "OAI-SearchBot", allow: "/", disallow },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
