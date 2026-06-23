import type { MetadataRoute } from "next";
import { getStories } from "@/lib/stories";

const SITE = "https://faultlines.kytepush.com";
const CITY_SLUGS = ["seattle", "sf", "nyc", "la", "chicago", "dc"];

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const stat: MetadataRoute.Sitemap = [
    { url: SITE, changeFrequency: "hourly", priority: 1 },
    { url: `${SITE}/about`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${SITE}/privacy`, changeFrequency: "yearly", priority: 0.2 },
    ...CITY_SLUGS.map((c) => ({ url: `${SITE}/city/${c}`, changeFrequency: "hourly" as const, priority: 0.8 })),
  ];
  let stories: MetadataRoute.Sitemap = [];
  try {
    const list = await getStories();
    stories = list.slice(0, 500).map((s) => ({
      url: `${SITE}/s/${s.id}`,
      lastModified: s.published_at ? new Date(s.published_at) : undefined,
      changeFrequency: "daily" as const,
      priority: 0.6,
    }));
  } catch { /* sitemap still works without story rows */ }
  return [...stat, ...stories];
}
