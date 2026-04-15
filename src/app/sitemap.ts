import type { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';

export const revalidate = 3600;

const BASE = 'https://ibasho.co.jp';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, changeFrequency: 'hourly', priority: 1.0, lastModified: new Date() },
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
      .select('id, created_at')
      .order('created_at', { ascending: false })
      .limit(5000);

    const postRoutes: MetadataRoute.Sitemap = (data ?? []).map((p: { id: string; created_at: string }) => ({
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
