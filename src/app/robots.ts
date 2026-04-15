import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/admin/', '/api/', '/mypage', '/auth/update-password'],
      },
    ],
    sitemap: 'https://ibasho.co.jp/sitemap.xml',
    host: 'https://ibasho.co.jp',
  };
}
