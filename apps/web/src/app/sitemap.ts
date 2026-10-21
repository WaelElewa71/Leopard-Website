import type { MetadataRoute } from "next";

const publicPaths = [
  "",
  "/about",
  "/services",
  "/quote",
  "/contact",
  "/feed-hub",
  "/academy",
  "/index-logistics",
  "/privacy",
  "/terms",
  "/disclaimer",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://leopard.invalid").replace(
    /\/$/,
    "",
  );
  const lastModified = new Date();

  return ["ar", "en"].flatMap((locale) =>
    publicPaths.map((path) => ({
      url: `${baseUrl}/${locale}${path}`,
      lastModified,
      changeFrequency: path === "" ? "monthly" : "yearly",
      priority: path === "" ? 1 : path === "/quote" ? 0.9 : 0.6,
    })),
  );
}
