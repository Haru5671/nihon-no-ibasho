import type { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';
import { SOUDAN_SLUGS } from '@/data/soudan';

export const revalidate = 3600;

const BASE = 'https://ibasho.co.jp';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const soudanRoutes: MetadataRoute.Sitemap = SOUDAN_SLUGS.map((slug) => ({
    url: `${BASE}/soudan/${slug}`,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
    lastModified: new Date(),
  }));

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, changeFrequency: 'hourly', priority: 1.0, lastModified: new Date() },
    ...soudanRoutes,
    { url: `${BASE}/auth/login`, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${BASE}/auth/signup`, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${BASE}/privacy`, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${BASE}/terms`, changeFrequency: 'yearly', priority: 0.2 },
  ];

  try {
    const db = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data } = await db
      .from('posts')
      .select('id, created_at, body')
      .order('created_at', { ascending: false })
      .limit(5000);

    const postRoutes: MetadataRoute.Sitemap = (data ?? [])
      // 薄い投稿(30文字未満)はthin contentなのでsitemapから除外
      .filter((p: { body?: string | null }) => (p.body?.trim().length ?? 0) >= 30)
      .map((p: { id: string; created_at: string }) => ({
        url: `${BASE}/posts/${p.id}`,
        lastModified: new Date(p.created_at),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }));

    return [...staticRoutes, ...postRoutes];
  } catch {
    return staticRoutes;
  }
}
