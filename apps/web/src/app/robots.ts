import type { MetadataRoute } from "next";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://filespay.org";

export default function robots(): MetadataRoute.Robots {
  return {
    host: SITE,
    sitemap: `${SITE}/sitemap.xml`,
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/downloads/", "/windows/", "/macos/", "/linux/"],
      },
    ],
  };
}
